import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  updateDoc, 
  doc, 
  getDoc, 
  setDoc,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { DevelopmentModeManager } from '@/utils/developmentMode';

export interface AnalyticsEvent {
  id: string;
  userId: string;
  sessionId: string;
  timestamp: Timestamp;
  type: 'page_view' | 'feature_usage' | 'session_start' | 'session_end' | 'node_created' | 'edge_created' | 'workflow_exported' | 'workflow_imported';
  data: Record<string, any>;
  route?: string;
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

export interface ConsentRecord {
  userId: string;
  hasConsented: boolean;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
  timestamp: Timestamp;
  ipHash?: string;
  userAgent?: string;
}

class FirestoreAnalyticsManager {
  private eventsCollection = 'analytics_events';
  private sessionsCollection = 'user_sessions';
  private consentCollection = 'consent_records';

  async storeEvent(event: Omit<AnalyticsEvent, 'timestamp' | 'environment'>): Promise<void> {
    if (DevelopmentModeManager.shouldSkipFirestore()) {
      DevelopmentModeManager.logFirestoreSkip('storeEvent');
      return;
    }

    try {
      const firestoreEvent: AnalyticsEvent = {
        ...event,
        timestamp: Timestamp.now(),
        environment: typeof window !== 'undefined' && 
                    (window.location.hostname.includes('lovable.dev') || 
                     window.location.hostname === 'localhost') ? 'development' : 'production'
      };

      await addDoc(collection(db, this.eventsCollection), firestoreEvent);
    } catch (error) {
      console.warn('Failed to store analytics event in Firestore:', error);
    }
  }

  async storeUserSession(session: FirestoreUserSession): Promise<void> {
    if (DevelopmentModeManager.shouldSkipFirestore()) {
      DevelopmentModeManager.logFirestoreSkip('storeUserSession');
      return;
    }

    try {
      await setDoc(doc(db, this.sessionsCollection, session.sessionId), session);
    } catch (error) {
      console.warn('Failed to store user session in Firestore:', error);
    }
  }

  async updateUserSession(sessionId: string, updates: Partial<FirestoreUserSession>): Promise<void> {
    if (DevelopmentModeManager.shouldSkipFirestore()) {
      DevelopmentModeManager.logFirestoreSkip('updateUserSession');
      return;
    }

    try {
      const sessionRef = doc(db, this.sessionsCollection, sessionId);
      await updateDoc(sessionRef, {
        ...updates,
        lastActivity: Timestamp.now()
      });
    } catch (error) {
      console.warn('Failed to update user session in Firestore:', error);
    }
  }

  async storeConsentRecord(consent: Omit<ConsentRecord, 'timestamp'>): Promise<void> {
    if (DevelopmentModeManager.shouldSkipFirestore()) {
      DevelopmentModeManager.logFirestoreSkip('storeConsentRecord');
      return;
    }

    try {
      const consentRecord: ConsentRecord = {
        ...consent,
        timestamp: Timestamp.now()
      };

      await setDoc(doc(db, this.consentCollection, consent.userId), consentRecord);
    } catch (error) {
      console.warn('Failed to store consent record in Firestore:', error);
    }
  }

  async getUserConsent(userId: string): Promise<ConsentRecord | null> {
    if (DevelopmentModeManager.shouldSkipFirestore()) {
      DevelopmentModeManager.logFirestoreSkip('getUserConsent');
      return null;
    }

    try {
      const consentRef = doc(db, this.consentCollection, userId);
      const consentSnap = await getDoc(consentRef);
      
      if (consentSnap.exists()) {
        return consentSnap.data() as ConsentRecord;
      }
      return null;
    } catch (error) {
      console.warn('Failed to get user consent from Firestore:', error);
      return null;
    }
  }

  async getRecentEvents(limitCount: number = 100): Promise<AnalyticsEvent[]> {
    if (DevelopmentModeManager.shouldSkipFirestore()) {
      DevelopmentModeManager.logFirestoreSkip('getRecentEvents');
      return [];
    }

    try {
      const q = query(
        collection(db, this.eventsCollection),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as AnalyticsEvent);
    } catch (error) {
      console.warn('Failed to get recent events from Firestore:', error);
      return [];
    }
  }

  async getEventsByType(eventType: AnalyticsEvent['type'], limitCount: number = 50): Promise<AnalyticsEvent[]> {
    if (DevelopmentModeManager.shouldSkipFirestore()) {
      DevelopmentModeManager.logFirestoreSkip('getEventsByType');
      return [];
    }

    try {
      const q = query(
        collection(db, this.eventsCollection),
        where('type', '==', eventType),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as AnalyticsEvent);
    } catch (error) {
      console.warn('Failed to get events by type from Firestore:', error);
      return [];
    }
  }

  async getUserSessions(userId: string): Promise<FirestoreUserSession[]> {
    if (DevelopmentModeManager.shouldSkipFirestore()) {
      DevelopmentModeManager.logFirestoreSkip('getUserSessions');
      return [];
    }

    try {
      const q = query(
        collection(db, this.sessionsCollection),
        where('userId', '==', userId),
        orderBy('startTime', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as FirestoreUserSession);
    } catch (error) {
      console.warn('Failed to get user sessions from Firestore:', error);
      return [];
    }
  }
}

export const firestoreAnalytics = new FirestoreAnalyticsManager();
