
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

export class UserSessionUtils {
  static readonly SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
  static readonly DATA_RETENTION = 30 * 24 * 60 * 60 * 1000; // 30 days

  static isSessionExpired(session: UserSession): boolean {
    return Date.now() - session.lastActivity > this.SESSION_DURATION;
  }

  static isDataRetentionExpired(session: UserSession): boolean {
    return Date.now() - session.identifierCreated > this.DATA_RETENTION;
  }

  static toFirestoreSession(session: UserSession): FirestoreUserSession {
    return {
      id: session.sessionId,
      userId: session.userId,
      sessionId: session.sessionId,
      startTime: Timestamp.fromMillis(session.startTime),
      lastActivity: Timestamp.fromMillis(session.lastActivity),
      pageViews: session.pageViews,
      isActive: session.isActive,
      environment: this.getEnvironment()
    };
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
