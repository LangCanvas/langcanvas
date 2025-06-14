
import { analyticsStorage, AggregatedStats } from '@/utils/analyticsStorage';
import { isDevelopment } from '@/config/firebase';
import { AnalyticsEventManager, UnifiedAnalyticsEvent } from './analytics/analyticsEventManager';
import { QuotaManager } from './analytics/quotaManager';
import { SyncManager } from './analytics/syncManager';

export { UnifiedAnalyticsEvent } from './analytics/analyticsEventManager';

export class UnifiedAnalyticsService {
  private static instance: UnifiedAnalyticsService;
  private isOnline: boolean = navigator.onLine;
  private eventManager: AnalyticsEventManager;
  private quotaManager: QuotaManager;
  private syncManager: SyncManager;

  constructor() {
    this.eventManager = new AnalyticsEventManager();
    this.quotaManager = new QuotaManager();
    this.syncManager = new SyncManager(this.eventManager, this.quotaManager);
    
    this.setupOnlineListeners();
    this.initializeLocalStorage();
    
    // In development, force local-only mode to prevent quota issues
    if (isDevelopment) {
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
        this.syncManager.syncPendingEvents();
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

  async storeEvent(event: UnifiedAnalyticsEvent): Promise<void> {
    try {
      // Always store locally first
      await this.eventManager.storeEventLocally(event);

      // Only try Firestore if not in development, online, and quota is not exhausted
      if (!isDevelopment && this.isOnline && this.quotaManager.canRetryFirestore()) {
        try {
          await this.eventManager.storeEventRemotely(event);
        } catch (error) {
          if (this.quotaManager.isQuotaError(error)) {
            this.quotaManager.handleQuotaError();
          } else {
            console.warn('Failed to store event remotely:', error);
          }
          this.syncManager.addPendingEvent(event);
        }
      } else if (!isDevelopment) {
        this.syncManager.addPendingEvent(event);
      }
    } catch (error) {
      console.warn('Failed to store analytics event:', error);
    }
  }

  async getAggregatedStats(): Promise<AggregatedStats> {
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
      await this.eventManager.storeEventRemotely(unifiedEvent);
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
}

export const unifiedAnalytics = UnifiedAnalyticsService.getInstance();
