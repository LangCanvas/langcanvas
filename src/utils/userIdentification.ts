
import { DoNotTrackDetector } from '@/utils/doNotTrackDetection';
import { UserIdentifierManager } from './user/userIdentifierManager';
import { SessionManager } from './user/sessionManager';

export { UserSession } from './user/userSession';

export class UserIdentificationManager {
  // Re-export key methods for backward compatibility
  static generateUserId = UserIdentifierManager.generateUserId;
  static generateSessionId = SessionManager.generateSessionId;
  static shouldAllowTracking = UserIdentifierManager.shouldAllowTracking;
  static getUserId = UserIdentifierManager.getUserId;
  static setUserId = UserIdentifierManager.setUserId;
  static getCurrentSession = SessionManager.getCurrentSession;
  static startSession = SessionManager.startSession;
  static updateSession = SessionManager.updateSession;
  static endSession = SessionManager.endSession;
  static clearSession = SessionManager.clearSession;
  static globalOptOut = UserIdentifierManager.globalOptOut;
  static isOptedOut = UserIdentifierManager.isOptedOut;
  static optBackIn = UserIdentifierManager.optBackIn;

  static async forgetUser(): Promise<void> {
    try {
      await SessionManager.endSession();
      
      const keys = Object.keys(localStorage).filter(key => key.startsWith('langcanvas'));
      keys.forEach(key => localStorage.removeItem(key));
      
      const sessionKeys = Object.keys(sessionStorage).filter(key => key.startsWith('langcanvas'));
      sessionKeys.forEach(key => sessionStorage.removeItem(key));
      
      console.log('🗑️ All user data has been forgotten');
    } catch (error) {
      console.warn('Failed to forget user data:', error);
    }
  }

  static getPrivacyStatus(): {
    doNotTrack: boolean;
    globalPrivacyControl: boolean;
    optedOut: boolean;
    trackingAllowed: boolean;
  } {
    const privacySignals = DoNotTrackDetector.getPrivacySignals();
    const optedOut = UserIdentifierManager.isOptedOut();
    
    return {
      ...privacySignals,
      optedOut,
      trackingAllowed: UserIdentifierManager.shouldAllowTracking()
    };
  }
}
