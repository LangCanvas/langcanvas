
export const GOOGLE_CLIENT_ID = '425198427847-rfucr78mvnma3qv94pn9utas046svokk.apps.googleusercontent.com';

export interface GoogleAuthConfig {
  client_id: string;
  callback: (response: any) => void;
  auto_select: boolean;
  cancel_on_tap_outside: boolean;
  use_fedcm_for_prompt: boolean;
  ux_mode: string;
  redirect_uri?: string;
}

export interface GoogleAuthUser {
  email: string;
  name: string;
  picture?: string;
}

export interface AuthenticationError {
  type: 'popup_blocked' | 'domain_unauthorized' | 'user_cancelled' | 'network_error' | 'initialization_failed' | 'unknown';
  message: string;
  details?: string;
}

export class AuthErrorHandler {
  static createAuthError(type: AuthenticationError['type'], message: string, details?: string): AuthenticationError {
    return {
      type,
      message,
      details: details || `Domain: ${window.location.hostname}, Protocol: ${window.location.protocol}`
    };
  }

  static getDiagnosticInfo(): Record<string, any> {
    return {
      domain: window.location.hostname,
      origin: window.location.origin,
      protocol: window.location.protocol,
      userAgent: navigator.userAgent.substring(0, 100),
      cookiesEnabled: navigator.cookieEnabled,
      googleAvailable: !!window.google?.accounts?.id,
      thirdPartyCookies: this.checkThirdPartyCookies()
    };
  }

  private static checkThirdPartyCookies(): boolean {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch {
      return false;
    }
  }

  static getRequiredDomainConfig(): { origins: string[], redirects: string[] } {
    const origin = window.location.origin;
    const isLocalhost = window.location.hostname === 'localhost';
    
    return {
      origins: [
        origin,
        'https://langcanvas.lovable.app',
        ...(isLocalhost ? ['https://localhost:5173'] : [])
      ],
      redirects: [
        `${origin}/admin-login`,
        'https://langcanvas.lovable.app/admin-login',
        ...(isLocalhost ? ['https://localhost:5173/admin-login'] : [])
      ]
    };
  }
}
