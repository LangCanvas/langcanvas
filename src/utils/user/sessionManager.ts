
import { firestoreAnalytics } from '@/utils/firestoreAnalytics';
import { SessionStorageManager } from '@/utils/sessionStorage';
import { DevelopmentModeManager } from '@/utils/developmentMode';
import { UserSession, UserSessionUtils } from './userSession';
import { UserIdentifierManager } from './userIdentifierManager';

export class SessionManager {
  private static readonly SESSION_KEY = 'langcanvas_session';

  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static getCurrentSession(): UserSession | null {
    if (!UserIdentifierManager.shouldAllowTracking()) {
      return null;
    }
    
    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      if (!sessionData) return null;
      
      const session: UserSession = JSON.parse(sessionData);
      
      if (UserSessionUtils.isSessionExpired(session)) {
        this.clearSession();
        return null;
      }
      
      if (UserSessionUtils.isDataRetentionExpired(session)) {
        this.clearSession();
        return null;
      }
      
      return session;
    } catch {
      return null;
    }
  }

  static async startSession(hasAnalyticsConsent: boolean): Promise<UserSession | null> {
    if (!hasAnalyticsConsent || !UserIdentifierManager.shouldAllowTracking()) {
      return null;
    }

    return await SessionStorageManager.withLock(async () => {
      let userId = UserIdentifierManager.getUserId();
      if (!userId) {
        userId = UserIdentifierManager.generateUserId();
        UserIdentifierManager.setUserId(userId);
      }

      const sessionId = this.generateSessionId();
      const now = Date.now();

      const session: UserSession = {
        userId,
        sessionId,
        startTime: now,
        lastActivity: now,
        pageViews: 0,
        isActive: true,
        identifierCreated: now,
        lastRotation: now
      };

      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      
      if (!DevelopmentModeManager.shouldSkipFirestore()) {
        this.storeSessionInFirestore(session).catch(console.warn);
      }
      
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
      
      if (!DevelopmentModeManager.shouldSkipFirestore()) {
        this.updateSessionInFirestore(session).catch(console.warn);
      }
      
      return session;
    });
  }

  static async endSession(): Promise<void> {
    await SessionStorageManager.withLock(async () => {
      const session = this.getCurrentSession();
      if (session) {
        session.isActive = false;
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        
        if (!DevelopmentModeManager.shouldSkipFirestore()) {
          this.updateSessionInFirestore(session).catch(console.warn);
        }
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
    const firestoreSession = UserSessionUtils.toFirestoreSession(session);
    await firestoreAnalytics.storeUserSession(firestoreSession);
  }

  private static async updateSessionInFirestore(session: UserSession): Promise<void> {
    const firestoreSession = UserSessionUtils.toFirestoreSession(session);
    await firestoreAnalytics.storeUserSession(firestoreSession);
  }
}
