
import { firestoreAnalytics, AnalyticsEvent as FirestoreEvent } from '@/utils/firestoreAnalytics';
import { analyticsStorage, AnalyticsEvent as LocalEvent, AggregatedStats } from '@/utils/analyticsStorage';
import { UserIdentificationManager } from '@/utils/userIdentification';

export interface UnifiedAnalyticsEvent {
  id: string;
  userId: string;
  sessionId: string;
  timestamp: number;
  type: 'page_view' | 'feature_usage' | 'session_start' | 'session_end' | 'node_created' | 'edge_created' | 'workflow_exported' | 'workflow_imported';
  data: Record<string, any>;
  route?: string;
}

export class UnifiedAnalyticsService {
  private static instance: UnifiedAnalyticsService;
  private isOnline: boolean = navigator.onLine;
  private pendingEvents: UnifiedAnalyticsEvent[] = [];

  constructor() {
    // Monitor online status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingEvents();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Initialize local storage
    this.initializeLocalStorage();
  }

  static getInstance(): UnifiedAnalyticsService {
    if (!UnifiedAnalyticsService.instance) {
      UnifiedAnalyticsService.instance = new UnifiedAnalyticsService();
    }
    return UnifiedAnalyticsService.instance;
  }

  private async initializeLocalStorage(): Promise<void> {
    try {
      await analyticsStorage.init();
    } catch (error) {
      console.warn('Failed to initialize local analytics storage:', error);
    }
  }

  async storeEvent(event: UnifiedAnalyticsEvent): Promise<void> {
    try {
      // Always store locally first for immediate access
      await this.storeEventLocally(event);

      // Store in Firestore if online and user has consented
      if (this.isOnline) {
        await this.storeEventRemotely(event);
      } else {
        // Queue for later sync when online
        this.pendingEvents.push(event);
      }
    } catch (error) {
      console.warn('Failed to store analytics event:', error);
      // Fallback to local storage only
      await this.storeEventLocally(event);
    }
  }

  private async storeEventLocally(event: UnifiedAnalyticsEvent): Promise<void> {
    const localEvent: LocalEvent = {
      ...event,
      timestamp: event.timestamp
    };
    
    await analyticsStorage.storeEvent(localEvent);
  }

  private async storeEventRemotely(event: UnifiedAnalyticsEvent): Promise<void> {
    const firestoreEvent: Omit<FirestoreEvent, 'timestamp' | 'environment'> = {
      id: event.id,
      userId: event.userId,
      sessionId: event.sessionId,
      type: event.type,
      data: event.data,
      route: event.route
    };

    await firestoreAnalytics.storeEvent(firestoreEvent);
  }

  private async syncPendingEvents(): Promise<void> {
    if (this.pendingEvents.length === 0) return;

    const eventsToSync = [...this.pendingEvents];
    this.pendingEvents = [];

    try {
      for (const event of eventsToSync) {
        await this.storeEventRemotely(event);
      }
      console.log(`Synced ${eventsToSync.length} pending analytics events`);
    } catch (error) {
      console.warn('Failed to sync pending events, re-queuing:', error);
      this.pendingEvents.unshift(...eventsToSync);
    }
  }

  async getAggregatedStats(): Promise<AggregatedStats> {
    try {
      // Try to get fresh data from Firestore first
      if (this.isOnline) {
        const recentEvents = await firestoreAnalytics.getRecentEvents(1000);
        if (recentEvents.length > 0) {
          return this.computeStatsFromEvents(recentEvents.map(this.convertFirestoreToLocal));
        }
      }
    } catch (error) {
      console.warn('Failed to get remote analytics data, falling back to local:', error);
    }

    // Fallback to local data
    return await analyticsStorage.getAggregatedStats();
  }

  private convertFirestoreToLocal(firestoreEvent: any): LocalEvent {
    return {
      id: firestoreEvent.id,
      userId: firestoreEvent.userId,
      sessionId: firestoreEvent.sessionId,
      timestamp: firestoreEvent.timestamp?.toMillis ? firestoreEvent.timestamp.toMillis() : Date.now(),
      type: firestoreEvent.type,
      data: firestoreEvent.data || {},
      route: firestoreEvent.route
    };
  }

  private computeStatsFromEvents(events: LocalEvent[]): AggregatedStats {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    const uniqueUsers = new Set(events.map(e => e.userId)).size;
    const uniqueSessions = new Set(events.map(e => e.sessionId)).size;
    const totalPageViews = events.filter(e => e.type === 'page_view').length;
    
    const recentEvents = events.filter(e => e.timestamp > oneDayAgo);
    const activeUsers = new Set(recentEvents.map(e => e.userId)).size;

    const featureUsage: Record<string, number> = {};
    events.filter(e => e.type === 'feature_usage').forEach(event => {
      const feature = event.data.feature || 'unknown';
      featureUsage[feature] = (featureUsage[feature] || 0) + 1;
    });

    const dailyStats: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const dayStart = now - (i * 24 * 60 * 60 * 1000);
      const dayEnd = dayStart + (24 * 60 * 60 * 1000);
      const dateKey = new Date(dayStart).toISOString().split('T')[0];
      
      const dayEvents = events.filter(e => e.timestamp >= dayStart && e.timestamp < dayEnd);
      dailyStats[dateKey] = new Set(dayEvents.map(e => e.userId)).size;
    }

    return {
      totalUniqueUsers: uniqueUsers,
      totalSessions: uniqueSessions,
      totalPageViews,
      activeUsers,
      featureUsage,
      dailyStats,
      lastUpdated: now
    };
  }

  async migrateLocalToRemote(): Promise<void> {
    if (!this.isOnline) {
      console.warn('Cannot migrate data while offline');
      return;
    }

    try {
      const localEvents = await analyticsStorage.getEvents();
      console.log(`Migrating ${localEvents.length} local events to Firestore...`);

      for (const localEvent of localEvents) {
        const unifiedEvent: UnifiedAnalyticsEvent = {
          ...localEvent,
          timestamp: localEvent.timestamp
        };
        
        await this.storeEventRemotely(unifiedEvent);
      }

      console.log('Migration completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    try {
      await analyticsStorage.cleanup();
      console.log('Analytics cleanup completed');
    } catch (error) {
      console.warn('Failed to cleanup analytics data:', error);
    }
  }
}

export const unifiedAnalytics = UnifiedAnalyticsService.getInstance();
