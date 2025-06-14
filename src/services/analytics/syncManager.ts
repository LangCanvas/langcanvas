
import { UnifiedAnalyticsEvent } from './analyticsEventManager';
import { AnalyticsEventManager } from './analyticsEventManager';
import { QuotaManager } from './quotaManager';
import { isDevelopment } from '@/config/firebase';

export class SyncManager {
  private pendingEvents: UnifiedAnalyticsEvent[] = [];
  private eventManager: AnalyticsEventManager;
  private quotaManager: QuotaManager;

  constructor(eventManager: AnalyticsEventManager, quotaManager: QuotaManager) {
    this.eventManager = eventManager;
    this.quotaManager = quotaManager;
  }

  addPendingEvent(event: UnifiedAnalyticsEvent): void {
    if (!isDevelopment) {
      this.pendingEvents.push(event);
    }
  }

  async syncPendingEvents(): Promise<void> {
    if (isDevelopment) return; // Don't sync in development
    
    if (this.pendingEvents.length === 0 || !this.quotaManager.canRetryFirestore()) return;

    const eventsToSync = [...this.pendingEvents];
    this.pendingEvents = [];

    try {
      for (const event of eventsToSync) {
        await this.eventManager.storeEventRemotely(event);
      }
      console.log(`✅ Synced ${eventsToSync.length} pending analytics events`);
    } catch (error) {
      if (this.quotaManager.isQuotaError(error)) {
        this.quotaManager.handleQuotaError();
      }
      console.warn('Failed to sync pending events, re-queuing:', error);
      this.pendingEvents.unshift(...eventsToSync);
    }
  }

  getPendingEventCount(): number {
    return this.pendingEvents.length;
  }
}
