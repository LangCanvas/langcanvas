
import { firestoreAnalytics, FirestoreUserSession } from '@/utils/firestoreAnalytics';
import { SessionStorageManager } from '@/utils/sessionStorage';
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

    return await SessionStorageManager.withLock(async () => {
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

      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      this.storeSessionInFirestore(session).catch(console.warn);
      return session;
    });
  }

  static async updateSession(): Promise<UserSession | null> {
    return await SessionStorageManager.withLock(async () => {
      const session = this.getCurrentSession();
      if (!session) return null;

      const now = Date.now();
      session.lastActivity = now;
      session.pageViews += 1;

      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      this.updateSessionInFirestore(session).catch(console.warn);
      return session;
    });
  }

  static async endSession(): Promise<void> {
    await SessionStorageManager.withLock(async () => {
      const session = this.getCurrentSession();
      if (session) {
        session.isActive = false;
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        this.updateSessionInFirestore(session).catch(console.warn);
      }
    });
  }

  static clearSession(): void {
    try {
      localStorage.removeItem(this.SESSION_KEY);
    } catch (error) {
      console.warn('Failed to clear session:', error);
    }
  }

  private static async storeSessionInFirestore(session: UserSession): Promise<void> {
    const firestoreSession: FirestoreUserSession = {
      id: session.sessionId,
      userId: session.userId,
      sessionId: session.sessionId,
      startTime: Timestamp.fromMillis(session.startTime),
      lastActivity: Timestamp.fromMillis(session.lastActivity),
      pageViews: session.pageViews,
      isActive: session.isActive,
      environment: this.getEnvironment()
    };

    await firestoreAnalytics.storeUserSession(firestoreSession);
  }

  private static async updateSessionInFirestore(session: UserSession): Promise<void> {
    const firestoreSession: FirestoreUserSession = {
      id: session.sessionId,
      userId: session.userId,
      sessionId: session.sessionId,
      startTime: Timestamp.fromMillis(session.startTime),
      lastActivity: Timestamp.fromMillis(session.lastActivity),
      pageViews: session.pageViews,
      isActive: session.isActive,
      environment: this.getEnvironment()
    };

    await firestoreAnalytics.storeUserSession(firestoreSession);
  }

  private static getEnvironment(): "development" | "production" {
    if (typeof window !== 'undefined' && 
        (window.location.hostname.includes('lovable.dev') || 
         window.location.hostname === 'localhost')) {
      return 'development';
    }
    return 'production';
  }
}
