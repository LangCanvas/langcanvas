
import { firestoreAnalytics, AnalyticsEvent as FirestoreEvent } from '@/utils/firestoreAnalytics';
import { analyticsStorage, AnalyticsEvent as LocalEvent } from '@/utils/analyticsStorage';
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

export class AnalyticsEventManager {
  async storeEventLocally(event: UnifiedAnalyticsEvent): Promise<void> {
    const localEvent: LocalEvent = { ...event };
    await analyticsStorage.storeEvent(localEvent);
  }

  async storeEventRemotely(event: UnifiedAnalyticsEvent): Promise<void> {
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
}
