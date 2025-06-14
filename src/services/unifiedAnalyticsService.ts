
import { firestoreAnalytics, AnalyticsEvent as FirestoreEvent } from '@/utils/firestoreAnalytics';
import { analyticsStorage, AnalyticsEvent as LocalEvent, AggregatedStats } from '@/utils/analyticsStorage';
import { AnalyticsComputation } from '@/utils/analyticsComputation';
import { isDevelopment } from '@/config/firebase';

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
  private quotaExhausted: boolean = false;
  private lastQuotaError: number = 0;
  private retryDelay: number = 60000; // Start with 1 minute delay

  constructor() {
    this.setupOnlineListeners();
    this.initializeLocalStorage();
    
    // In development, force local-only mode to prevent quota issues
    if (isDevelopment) {
      this.quotaExhausted = true;
      console.log('🔧 Development mode: Analytics set to local-only to prevent Firestore quota issues');
    }
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
      if (!isDevelopment) {
        this.syncPendingEvents();
      }
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

  private isQuotaError(error: any): boolean {
    return error?.code === 'resource-exhausted' || 
           error?.message?.includes('Quota exceeded') ||
           error?.message?.includes('resource-exhausted');
  }

  private handleQuotaError(): void {
    this.quotaExhausted = true;
    this.lastQuotaError = Date.now();
    // Exponential backoff: double the delay each time, max 1 hour
    this.retryDelay = Math.min(this.retryDelay * 2, 3600000);
    console.warn(`🔥 Firestore quota exhausted. Will retry in ${this.retryDelay / 1000} seconds`);
  }

  private canRetryFirestore(): boolean {
    // Never retry in development to prevent quota issues
    if (isDevelopment) return false;
    
    if (!this.quotaExhausted) return true;
    
    const timeSinceError = Date.now() - this.lastQuotaError;
    if (timeSinceError > this.retryDelay) {
      this.quotaExhausted = false;
      return true;
    }
    return false;
  }

  async storeEvent(event: UnifiedAnalyticsEvent): Promise<void> {
    try {
      // Always store locally first
      await this.storeEventLocally(event);

      // Only try Firestore if not in development, online, and quota is not exhausted
      if (!isDevelopment && this.isOnline && this.canRetryFirestore()) {
        try {
          await this.storeEventRemotely(event);
        } catch (error) {
          if (this.isQuotaError(error)) {
            this.handleQuotaError();
          } else {
            console.warn('Failed to store event remotely:', error);
          }
          // Add to pending events for later sync (production only)
          this.pendingEvents.push(event);
        }
      } else if (!isDevelopment) {
        // Only queue for sync in production
        this.pendingEvents.push(event);
      }
    } catch (error) {
      console.warn('Failed to store analytics event:', error);
    }
  }

  async getAggregatedStats(): Promise<AggregatedStats> {
    // Always use local storage to avoid quota issues
    return await analyticsStorage.getAggregatedStats();
  }

  async migrateLocalToRemote(): Promise<void> {
    if (isDevelopment) {
      throw new Error('Migration disabled in development environment');
    }
    
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
    if (isDevelopment) {
      console.log('🔧 Firestore write skipped in development environment');
      return;
    }

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
    if (isDevelopment) return; // Don't sync in development
    
    if (this.pendingEvents.length === 0 || !this.canRetryFirestore()) return;

    const eventsToSync = [...this.pendingEvents];
    this.pendingEvents = [];

    try {
      for (const event of eventsToSync) {
        await this.storeEventRemotely(event);
      }
      console.log(`✅ Synced ${eventsToSync.length} pending analytics events`);
    } catch (error) {
      if (this.isQuotaError(error)) {
        this.handleQuotaError();
      }
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
