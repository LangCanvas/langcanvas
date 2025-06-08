
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  limit,
  Timestamp,
  writeBatch,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { AnalyticsEvent, AggregatedStats } from './analyticsStorage';

export interface FirestoreAnalyticsEvent extends Omit<AnalyticsEvent, 'timestamp'> {
  timestamp: Timestamp;
  environment: 'development' | 'production';
}

export interface FirestoreUserSession {
  id: string;
  userId: string;
  sessionId: string;
  startTime: Timestamp;
  lastActivity: Timestamp;
  pageViews: number;
  isActive: boolean;
  environment: 'development' | 'production';
}

export interface FirestoreConsentRecord {
  userId: string;
  hasConsented: boolean;
  analytics: boolean;
  functional: boolean;
  timestamp: Timestamp;
  ipAddress?: string;
  userAgent?: string;
}

class FirestoreAnalyticsManager {
  private environment: 'development' | 'production';

  constructor() {
    this.environment = window.location.hostname.includes('lovable.dev') || 
                      window.location.hostname === 'localhost' ? 'development' : 'production';
  }

  async storeEvent(event: AnalyticsEvent): Promise<void> {
    try {
      const firestoreEvent: FirestoreAnalyticsEvent = {
        ...event,
        timestamp: Timestamp.fromMillis(event.timestamp),
        environment: this.environment
      };

      await addDoc(collection(db, 'analytics_events'), firestoreEvent);
    } catch (error) {
      console.warn('Failed to store analytics event:', error);
      // Fallback to local storage for critical events
      const events = JSON.parse(localStorage.getItem('fallback_analytics') || '[]');
      events.push(event);
      localStorage.setItem('fallback_analytics', JSON.stringify(events.slice(-100)));
    }
  }

  async storeUserSession(session: FirestoreUserSession): Promise<void> {
    try {
      await setDoc(doc(db, 'user_sessions', session.id), session);
    } catch (error) {
      console.warn('Failed to store user session:', error);
    }
  }

  async getUserSession(sessionId: string): Promise<FirestoreUserSession | null> {
    try {
      const sessionDoc = await getDoc(doc(db, 'user_sessions', sessionId));
      return sessionDoc.exists() ? sessionDoc.data() as FirestoreUserSession : null;
    } catch (error) {
      console.warn('Failed to get user session:', error);
      return null;
    }
  }

  async storeConsentRecord(consent: FirestoreConsentRecord): Promise<void> {
    try {
      await addDoc(collection(db, 'consent_records'), consent);
    } catch (error) {
      console.warn('Failed to store consent record:', error);
    }
  }

  async getEvents(filters?: {
    userId?: string;
    sessionId?: string;
    type?: string;
    startTime?: number;
    endTime?: number;
    limitCount?: number;
  }): Promise<AnalyticsEvent[]> {
    try {
      let q = query(
        collection(db, 'analytics_events'),
        where('environment', '==', this.environment),
        orderBy('timestamp', 'desc')
      );

      if (filters?.userId) {
        q = query(q, where('userId', '==', filters.userId));
      }
      if (filters?.sessionId) {
        q = query(q, where('sessionId', '==', filters.sessionId));
      }
      if (filters?.type) {
        q = query(q, where('type', '==', filters.type));
      }
      if (filters?.limitCount) {
        q = query(q, limit(filters.limitCount));
      }

      const querySnapshot = await getDocs(q);
      const events: AnalyticsEvent[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirestoreAnalyticsEvent;
        const event: AnalyticsEvent = {
          ...data,
          timestamp: data.timestamp.toMillis()
        };

        // Apply client-side filters
        if (filters?.startTime && event.timestamp < filters.startTime) return;
        if (filters?.endTime && event.timestamp > filters.endTime) return;

        events.push(event);
      });

      return events;
    } catch (error) {
      console.warn('Failed to get events from Firestore, falling back to local storage:', error);
      // Fallback to local storage
      const events = JSON.parse(localStorage.getItem('fallback_analytics') || '[]');
      return events;
    }
  }

  async getAggregatedStats(): Promise<AggregatedStats> {
    try {
      const events = await this.getEvents({ limitCount: 10000 });
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
    } catch (error) {
      console.warn('Failed to get aggregated stats:', error);
      return {
        totalUniqueUsers: 0,
        totalSessions: 0,
        totalPageViews: 0,
        activeUsers: 0,
        featureUsage: {},
        dailyStats: {},
        lastUpdated: Date.now()
      };
    }
  }

  subscribeToRealTimeStats(callback: (stats: AggregatedStats) => void): Unsubscribe {
    const unsubscribe = onSnapshot(
      query(
        collection(db, 'analytics_events'),
        where('environment', '==', this.environment),
        orderBy('timestamp', 'desc'),
        limit(100)
      ),
      async () => {
        const stats = await this.getAggregatedStats();
        callback(stats);
      },
      (error) => {
        console.warn('Real-time stats subscription error:', error);
      }
    );

    return unsubscribe;
  }

  async batchStoreEvents(events: AnalyticsEvent[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      const eventsCollection = collection(db, 'analytics_events');

      events.forEach((event) => {
        const firestoreEvent: FirestoreAnalyticsEvent = {
          ...event,
          timestamp: Timestamp.fromMillis(event.timestamp),
          environment: this.environment
        };
        const docRef = doc(eventsCollection);
        batch.set(docRef, firestoreEvent);
      });

      await batch.commit();
    } catch (error) {
      console.warn('Failed to batch store events:', error);
      // Store individually as fallback
      for (const event of events) {
        await this.storeEvent(event);
      }
    }
  }

  async cleanup(): Promise<void> {
    try {
      const cutoffTime = Timestamp.fromMillis(Date.now() - (90 * 24 * 60 * 60 * 1000));
      const oldEventsQuery = query(
        collection(db, 'analytics_events'),
        where('timestamp', '<=', cutoffTime),
        limit(500)
      );

      const querySnapshot = await getDocs(oldEventsQuery);
      const batch = writeBatch(db);

      querySnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    } catch (error) {
      console.warn('Failed to cleanup old events:', error);
    }
  }
}

export const firestoreAnalytics = new FirestoreAnalyticsManager();
