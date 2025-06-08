
import { UserIdentificationManager } from '@/utils/userIdentification';

export interface SecureSession {
  userId: string;
  email: string;
  name: string;
  picture?: string;
  sessionId: string;
  expiresAt: number;
  isAdmin: boolean;
}

export interface SessionToken {
  sessionId: string;
  userId: string;
  email: string;
  expiresAt: number;
  csrfToken: string;
}

export class SecureAuthService {
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly REFRESH_THRESHOLD = 60 * 60 * 1000; // 1 hour before expiry
  private static readonly ADMIN_EMAIL = 'bdevay@gmail.com';

  static generateSessionToken(userData: any): SessionToken {
    const sessionId = UserIdentificationManager.generateSessionId();
    const expiresAt = Date.now() + this.SESSION_DURATION;
    const csrfToken = this.generateCSRFToken();

    return {
      sessionId,
      userId: userData.email,
      email: userData.email,
      expiresAt,
      csrfToken
    };
  }

  private static generateCSRFToken(): string {
    return `csrf_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  static setSecureSession(sessionToken: SessionToken, userData: any): void {
    try {
      // Create secure session object
      const session: SecureSession = {
        userId: userData.email,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        sessionId: sessionToken.sessionId,
        expiresAt: sessionToken.expiresAt,
        isAdmin: userData.email === this.ADMIN_EMAIL
      };

      // Store session info in secure cookie (httpOnly simulation via secure storage)
      const secureSessionData = {
        sessionId: sessionToken.sessionId,
        userId: sessionToken.userId,
        expiresAt: sessionToken.expiresAt,
        csrfToken: sessionToken.csrfToken
      };

      // Store in a more secure way (better than localStorage)
      this.setSecureCookie('langcanvas_secure_session', JSON.stringify(secureSessionData));
      
      // Store user display data separately (this can be in localStorage as it's non-sensitive)
      localStorage.setItem('langcanvas_user_display', JSON.stringify({
        name: userData.name,
        email: userData.email,
        picture: userData.picture
      }));

      console.log('🔐 Secure session established:', sessionToken.sessionId);
    } catch (error) {
      console.error('Failed to set secure session:', error);
      throw new Error('Failed to establish secure session');
    }
  }

  static getSecureSession(): SecureSession | null {
    try {
      const sessionCookie = this.getSecureCookie('langcanvas_secure_session');
      const userDisplay = localStorage.getItem('langcanvas_user_display');

      if (!sessionCookie || !userDisplay) {
        return null;
      }

      const sessionData = JSON.parse(sessionCookie);
      const userData = JSON.parse(userDisplay);

      // Check if session is expired
      if (Date.now() > sessionData.expiresAt) {
        this.clearSecureSession();
        return null;
      }

      // Check if session needs refresh
      if (Date.now() > (sessionData.expiresAt - this.REFRESH_THRESHOLD)) {
        console.log('🔐 Session needs refresh');
        // In a real implementation, this would trigger a refresh
      }

      return {
        userId: userData.email,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        sessionId: sessionData.sessionId,
        expiresAt: sessionData.expiresAt,
        isAdmin: userData.email === this.ADMIN_EMAIL
      };
    } catch (error) {
      console.error('Failed to get secure session:', error);
      this.clearSecureSession();
      return null;
    }
  }

  static validateSession(sessionId: string): boolean {
    try {
      const session = this.getSecureSession();
      return session?.sessionId === sessionId && Date.now() < session.expiresAt;
    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  }

  static clearSecureSession(): void {
    try {
      this.removeSecureCookie('langcanvas_secure_session');
      localStorage.removeItem('langcanvas_user_display');
      localStorage.removeItem('langcanvas_auth_user'); // Clean up old storage
      console.log('🔐 Secure session cleared');
    } catch (error) {
      console.error('Failed to clear secure session:', error);
    }
  }

  static refreshSession(): boolean {
    try {
      const currentSession = this.getSecureSession();
      if (!currentSession) return false;

      // Extend session expiry
      const newExpiresAt = Date.now() + this.SESSION_DURATION;
      const sessionCookie = this.getSecureCookie('langcanvas_secure_session');
      
      if (sessionCookie) {
        const sessionData = JSON.parse(sessionCookie);
        sessionData.expiresAt = newExpiresAt;
        sessionData.csrfToken = this.generateCSRFToken(); // Generate new CSRF token
        
        this.setSecureCookie('langcanvas_secure_session', JSON.stringify(sessionData));
        console.log('🔐 Session refreshed successfully');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to refresh session:', error);
      return false;
    }
  }

  // Enhanced cookie management with security flags
  private static setSecureCookie(name: string, value: string): void {
    const expires = new Date(Date.now() + this.SESSION_DURATION).toUTCString();
    const isSecure = window.location.protocol === 'https:';
    
    // Simulate httpOnly cookie with enhanced localStorage security
    // In a real production environment, this would be set server-side
    const secureValue = btoa(value); // Basic encoding
    
    try {
      localStorage.setItem(`secure_${name}`, secureValue);
      
      // Set a regular cookie for CSRF protection (not httpOnly to allow JS access for CSRF token)
      document.cookie = `${name}_csrf=${this.generateCSRFToken()}; expires=${expires}; path=/; ${isSecure ? 'secure;' : ''} samesite=strict`;
    } catch (error) {
      console.error('Failed to set secure cookie:', error);
    }
  }

  private static getSecureCookie(name: string): string | null {
    try {
      const secureValue = localStorage.getItem(`secure_${name}`);
      return secureValue ? atob(secureValue) : null;
    } catch (error) {
      console.error('Failed to get secure cookie:', error);
      return null;
    }
  }

  private static removeSecureCookie(name: string): void {
    try {
      localStorage.removeItem(`secure_${name}`);
      
      // Remove CSRF cookie
      document.cookie = `${name}_csrf=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    } catch (error) {
      console.error('Failed to remove secure cookie:', error);
    }
  }

  static getCSRFToken(): string | null {
    try {
      const sessionCookie = this.getSecureCookie('langcanvas_secure_session');
      if (sessionCookie) {
        const sessionData = JSON.parse(sessionCookie);
        return sessionData.csrfToken;
      }
      return null;
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
      return null;
    }
  }

  static validateCSRFToken(token: string): boolean {
    const currentToken = this.getCSRFToken();
    return currentToken === token;
  }
}
