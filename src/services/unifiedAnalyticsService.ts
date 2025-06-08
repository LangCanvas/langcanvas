
import { firestoreAnalytics, AnalyticsEvent as FirestoreEvent } from '@/utils/firestoreAnalytics';
import { analyticsStorage, AnalyticsEvent as LocalEvent, AggregatedStats } from '@/utils/analyticsStorage';
import { AnalyticsComputation } from '@/utils/analyticsComputation';

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
    this.setupOnlineListeners();
    this.initializeLocalStorage();
  }

  static getInstance(): UnifiedAnalyticsService {
    if (!UnifiedAnalyticsService.instance) {
      UnifiedAnalyticsService.instance = new UnifiedAnalyticsService();
    }
    return UnifiedAnalyticsService.instance;
  }

  private setupOnlineListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingEvents();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
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
      await this.storeEventLocally(event);

      if (this.isOnline) {
        await this.storeEventRemotely(event);
      } else {
        this.pendingEvents.push(event);
      }
    } catch (error) {
      console.warn('Failed to store analytics event:', error);
      await this.storeEventLocally(event);
    }
  }

  async getAggregatedStats(): Promise<AggregatedStats> {
    try {
      if (this.isOnline) {
        const recentEvents = await firestoreAnalytics.getRecentEvents(1000);
        if (recentEvents.length > 0) {
          return AnalyticsComputation.computeStatsFromEvents(
            recentEvents.map(this.convertFirestoreToLocal)
          );
        }
      }
    } catch (error) {
      console.warn('Failed to get remote analytics data, falling back to local:', error);
    }

    return await analyticsStorage.getAggregatedStats();
  }

  async migrateLocalToRemote(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Cannot migrate data while offline');
    }

    const localEvents = await analyticsStorage.getEvents();
    console.log(`Migrating ${localEvents.length} local events to Firestore...`);

    for (const localEvent of localEvents) {
      const unifiedEvent: UnifiedAnalyticsEvent = { ...localEvent };
      await this.storeEventRemotely(unifiedEvent);
    }

    console.log('Migration completed successfully');
  }

  async cleanup(): Promise<void> {
    try {
      await analyticsStorage.cleanup();
      console.log('Analytics cleanup completed');
    } catch (error) {
      console.warn('Failed to cleanup analytics data:', error);
    }
  }

  private async storeEventLocally(event: UnifiedAnalyticsEvent): Promise<void> {
    const localEvent: LocalEvent = { ...event };
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
}

export const unifiedAnalytics = UnifiedAnalyticsService.getInstance();
