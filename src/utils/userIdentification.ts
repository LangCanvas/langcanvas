
import { firestoreAnalytics, FirestoreUserSession } from '@/utils/firestoreAnalytics';
import { Timestamp } from 'firebase/firestore';

export interface UserSession {
  userId: string;
  sessionId: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  isActive: boolean;
}

export class UserIdentificationManager {
  private static readonly USER_ID_KEY = 'langcanvas_user_id';
  private static readonly SESSION_KEY = 'langcanvas_session';
  private static readonly SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

  static generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static getUserId(): string | null {
    try {
      return localStorage.getItem(this.USER_ID_KEY);
    } catch {
      return null;
    }
  }

  static setUserId(userId: string): void {
    try {
      localStorage.setItem(this.USER_ID_KEY, userId);
    } catch (error) {
      console.warn('Failed to store user ID:', error);
    }
  }

  static getCurrentSession(): UserSession | null {
    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      if (!sessionData) return null;
      
      const session: UserSession = JSON.parse(sessionData);
      
      // Check if session is expired
      if (Date.now() - session.lastActivity > this.SESSION_DURATION) {
        this.clearSession();
        return null;
      }
      
      return session;
    } catch {
      return null;
    }
  }

  static async startSession(hasAnalyticsConsent: boolean): Promise<UserSession | null> {
    if (!hasAnalyticsConsent) return null;

    try {
      let userId = this.getUserId();
      if (!userId) {
        userId = this.generateUserId();
        this.setUserId(userId);
      }

      const sessionId = this.generateSessionId();
      const now = Date.now();

      const session: UserSession = {
        userId,
        sessionId,
        startTime: now,
        lastActivity: now,
        pageViews: 0,
        isActive: true
      };

      // Store locally for immediate access
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

      // Store in Firestore for analytics
      const firestoreSession: FirestoreUserSession = {
        id: sessionId,
        userId,
        sessionId,
        startTime: Timestamp.fromMillis(now),
        lastActivity: Timestamp.fromMillis(now),
        pageViews: 0,
        isActive: true,
        environment: window.location.hostname.includes('lovable.dev') || 
                    window.location.hostname === 'localhost' ? 'development' : 'production'
      };

      await firestoreAnalytics.storeUserSession(firestoreSession);

      return session;
    } catch (error) {
      console.warn('Failed to start session:', error);
      return null;
    }
  }

  static async updateSession(): Promise<UserSession | null> {
    try {
      const session = this.getCurrentSession();
      if (!session) return null;

      const now = Date.now();
      session.lastActivity = now;
      session.pageViews += 1;

      // Update locally
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

      // Update in Firestore
      const firestoreSession: FirestoreUserSession = {
        id: session.sessionId,
        userId: session.userId,
        sessionId: session.sessionId,
        startTime: Timestamp.fromMillis(session.startTime),
        lastActivity: Timestamp.fromMillis(now),
        pageViews: session.pageViews,
        isActive: true,
        environment: window.location.hostname.includes('lovable.dev') || 
                    window.location.hostname === 'localhost' ? 'development' : 'production'
      };

      await firestoreAnalytics.storeUserSession(firestoreSession);

      return session;
    } catch (error) {
      console.warn('Failed to update session:', error);
      return null;
    }
  }

  static clearSession(): void {
    try {
      localStorage.removeItem(this.SESSION_KEY);
    } catch (error) {
      console.warn('Failed to clear session:', error);
    }
  }

  static async endSession(): Promise<void> {
    try {
      const session = this.getCurrentSession();
      if (session) {
        session.isActive = false;
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

        // Update in Firestore
        const firestoreSession: FirestoreUserSession = {
          id: session.sessionId,
          userId: session.userId,
          sessionId: session.sessionId,
          startTime: Timestamp.fromMillis(session.startTime),
          lastActivity: Timestamp.fromMillis(session.lastActivity),
          pageViews: session.pageViews,
          isActive: false,
          environment: window.location.hostname.includes('lovable.dev') || 
                      window.location.hostname === 'localhost' ? 'development' : 'production'
        };

        await firestoreAnalytics.storeUserSession(firestoreSession);
      }
    } catch (error) {
      console.warn('Failed to end session:', error);
    }
  }
}
