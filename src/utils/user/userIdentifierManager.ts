
import { DoNotTrackDetector } from '@/utils/doNotTrackDetection';

export class UserIdentifierManager {
  private static readonly USER_ID_KEY = 'langcanvas_user_id';
  private static readonly ROTATION_KEY = 'langcanvas_id_rotation';
  private static readonly ROTATION_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days

  static generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static shouldAllowTracking(): boolean {
    if (DoNotTrackDetector.shouldRespectPrivacy()) {
      return false;
    }
    
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

  private static shouldRotateIdentifier(): boolean {
    try {
      const lastRotation = localStorage.getItem(this.ROTATION_KEY);
      if (!lastRotation) return true;
      
      const rotationTime = parseInt(lastRotation);
      return Date.now() - rotationTime > this.ROTATION_INTERVAL;
    } catch {
      return true;
    }
  }

  private static rotateUserId(): string {
    const newUserId = this.generateUserId();
    this.setUserId(newUserId);
    console.log('🔄 User identifier rotated for privacy protection');
    return newUserId;
  }

  static isOptedOut(): boolean {
    return localStorage.getItem('langcanvas_privacy_optout') === 'true';
  }

  static async globalOptOut(): Promise<void> {
    localStorage.setItem('langcanvas_privacy_optout', 'true');
    console.log('🔒 User has globally opted out of tracking');
  }

  static async optBackIn(): Promise<void> {
    localStorage.removeItem('langcanvas_privacy_optout');
    console.log('✅ User has opted back into tracking');
  }
}
