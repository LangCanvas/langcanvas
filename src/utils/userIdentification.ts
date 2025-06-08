
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
  private static readonly STORAGE_LOCK_KEY = 'langcanvas_storage_lock';
  private static readonly LOCK_TIMEOUT = 5000; // 5 seconds

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

  private static async acquireStorageLock(): Promise<boolean> {
    const lockKey = this.STORAGE_LOCK_KEY;
    const lockTimeout = Date.now() + this.LOCK_TIMEOUT;
    
    try {
      // Check if lock exists and is not expired
      const existingLock = localStorage.getItem(lockKey);
      if (existingLock && parseInt(existingLock) > Date.now()) {
        return false; // Lock is held by another process
      }
      
      // Acquire lock
      localStorage.setItem(lockKey, lockTimeout.toString());
      return true;
    } catch {
      return false;
    }
  }

  private static releaseStorageLock(): void {
    try {
      localStorage.removeItem(this.STORAGE_LOCK_KEY);
    } catch {
      // Ignore errors during cleanup
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

    // Acquire lock to prevent concurrent session creation
    if (!await this.acquireStorageLock()) {
      console.warn('Could not acquire storage lock for session creation');
      return this.getCurrentSession(); // Return existing session if any
    }

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

      // Store in Firestore for analytics (non-blocking)
      this.storeSessionInFirestore(session).catch(error => {
        console.warn('Failed to store session in Firestore:', error);
      });

      return session;
    } catch (error) {
      console.warn('Failed to start session:', error);
      return null;
    } finally {
      this.releaseStorageLock();
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
      environment: typeof window !== 'undefined' && 
                  (window.location.hostname.includes('lovable.dev') || 
                   window.location.hostname === 'localhost') ? 'development' : 'production'
    };

    await firestoreAnalytics.storeUserSession(firestoreSession);
  }

  static async updateSession(): Promise<UserSession | null> {
    if (!await this.acquireStorageLock()) {
      return this.getCurrentSession(); // Return current session without updating
    }

    try {
      const session = this.getCurrentSession();
      if (!session) return null;

      const now = Date.now();
      session.lastActivity = now;
      session.pageViews += 1;

      // Update locally
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

      // Update in Firestore (non-blocking)
      this.updateSessionInFirestore(session).catch(error => {
        console.warn('Failed to update session in Firestore:', error);
      });

      return session;
    } catch (error) {
      console.warn('Failed to update session:', error);
      return null;
    } finally {
      this.releaseStorageLock();
    }
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
      environment: typeof window !== 'undefined' && 
                  (window.location.hostname.includes('lovable.dev') || 
                   window.location.hostname === 'localhost') ? 'development' : 'production'
    };

    await firestoreAnalytics.storeUserSession(firestoreSession);
  }

  static clearSession(): void {
    try {
      localStorage.removeItem(this.SESSION_KEY);
    } catch (error) {
      console.warn('Failed to clear session:', error);
    }
  }

  static async endSession(): Promise<void> {
    if (!await this.acquireStorageLock()) {
      return; // Cannot acquire lock, session might be handled by another tab
    }

    try {
      const session = this.getCurrentSession();
      if (session) {
        session.isActive = false;
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

        // Update in Firestore (non-blocking)
        this.updateSessionInFirestore(session).catch(error => {
          console.warn('Failed to end session in Firestore:', error);
        });
      }
    } catch (error) {
      console.warn('Failed to end session:', error);
    } finally {
      this.releaseStorageLock();
    }
  }

  static async cleanupExpiredSessions(): Promise<void> {
    // This could be called periodically to clean up expired sessions
    const cutoffTime = Date.now() - this.SESSION_DURATION;
    
    // In a real implementation, this would clean up expired sessions from storage
    // For now, we just clear the current session if it's expired
    const session = this.getCurrentSession();
    if (session && session.lastActivity < cutoffTime) {
      this.clearSession();
    }
  }
}
