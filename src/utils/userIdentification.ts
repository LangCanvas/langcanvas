
import { firestoreAnalytics, FirestoreUserSession } from '@/utils/firestoreAnalytics';
import { SessionStorageManager } from '@/utils/sessionStorage';
import { DoNotTrackDetector } from '@/utils/doNotTrackDetection';
import { DevelopmentModeManager } from '@/utils/developmentMode';
import { Timestamp } from 'firebase/firestore';

export interface UserSession {
  userId: string;
  sessionId: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  isActive: boolean;
  identifierCreated: number;
  lastRotation?: number;
}

export class UserIdentificationManager {
  private static readonly USER_ID_KEY = 'langcanvas_user_id';
  private static readonly SESSION_KEY = 'langcanvas_session';
  private static readonly ROTATION_KEY = 'langcanvas_id_rotation';
  private static readonly SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
  private static readonly ROTATION_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days
  private static readonly DATA_RETENTION = 30 * 24 * 60 * 60 * 1000; // 30 days

  static generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static shouldAllowTracking(): boolean {
    // Check DNT and privacy signals first
    if (DoNotTrackDetector.shouldRespectPrivacy()) {
      return false;
    }
    
    // Check if user has explicitly opted out
    const optOutStatus = localStorage.getItem('langcanvas_privacy_optout');
    if (optOutStatus === 'true') {
      return false;
    }
    
    return true;
  }

  static getUserId(): string | null {
    if (!this.shouldAllowTracking()) {
      return null;
    }
    
    try {
      const userId = localStorage.getItem(this.USER_ID_KEY);
      
      // Check if identifier needs rotation
      if (userId && this.shouldRotateIdentifier()) {
        return this.rotateUserId();
      }
      
      return userId;
    } catch {
      return null;
    }
  }

  static setUserId(userId: string): void {
    if (!this.shouldAllowTracking()) {
      return;
    }
    
    try {
      localStorage.setItem(this.USER_ID_KEY, userId);
      localStorage.setItem(this.ROTATION_KEY, Date.now().toString());
    } catch (error) {
      console.warn('Failed to store user ID:', error);
    }
  }

  static shouldRotateIdentifier(): boolean {
    try {
      const lastRotation = localStorage.getItem(this.ROTATION_KEY);
      if (!lastRotation) return true;
      
      const rotationTime = parseInt(lastRotation);
      return Date.now() - rotationTime > this.ROTATION_INTERVAL;
    } catch {
      return true;
    }
  }

  static rotateUserId(): string {
    const newUserId = this.generateUserId();
    this.setUserId(newUserId);
    console.log('🔄 User identifier rotated for privacy protection');
    return newUserId;
  }

  static getCurrentSession(): UserSession | null {
    if (!this.shouldAllowTracking()) {
      return null;
    }
    
    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      if (!sessionData) return null;
      
      const session: UserSession = JSON.parse(sessionData);
      
      // Check session expiration
      if (Date.now() - session.lastActivity > this.SESSION_DURATION) {
        this.clearSession();
        return null;
      }
      
      // Check data retention period
      if (Date.now() - session.identifierCreated > this.DATA_RETENTION) {
        this.clearSession();
        return null;
      }
      
      return session;
    } catch {
      return null;
    }
  }

  static async startSession(hasAnalyticsConsent: boolean): Promise<UserSession | null> {
    if (!hasAnalyticsConsent || !this.shouldAllowTracking()) {
      return null;
    }

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
        isActive: true,
        identifierCreated: now,
        lastRotation: now
      };

      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      
      // Only store in Firestore if not in development
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
      
      // Only update in Firestore if not in development
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
        
        // Only update in Firestore if not in development
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

  static async globalOptOut(): Promise<void> {
    // Set opt-out flag
    localStorage.setItem('langcanvas_privacy_optout', 'true');
    
    // Clear all existing data
    await this.forgetUser();
    
    console.log('🔒 User has globally opted out of tracking');
  }

  static async forgetUser(): Promise<void> {
    try {
      // End current session
      await this.endSession();
      
      // Clear all langcanvas data
      const keys = Object.keys(localStorage).filter(key => key.startsWith('langcanvas'));
      keys.forEach(key => localStorage.removeItem(key));
      
      // Clear session storage
      const sessionKeys = Object.keys(sessionStorage).filter(key => key.startsWith('langcanvas'));
      sessionKeys.forEach(key => sessionStorage.removeItem(key));
      
      console.log('🗑️ All user data has been forgotten');
    } catch (error) {
      console.warn('Failed to forget user data:', error);
    }
  }

  static isOptedOut(): boolean {
    return localStorage.getItem('langcanvas_privacy_optout') === 'true';
  }

  static async optBackIn(): Promise<void> {
    localStorage.removeItem('langcanvas_privacy_optout');
    console.log('✅ User has opted back into tracking');
  }

  static getPrivacyStatus(): {
    doNotTrack: boolean;
    globalPrivacyControl: boolean;
    optedOut: boolean;
    trackingAllowed: boolean;
  } {
    const privacySignals = DoNotTrackDetector.getPrivacySignals();
    const optedOut = this.isOptedOut();
    
    return {
      ...privacySignals,
      optedOut,
      trackingAllowed: this.shouldAllowTracking()
    };
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
