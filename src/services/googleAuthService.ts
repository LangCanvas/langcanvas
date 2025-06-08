
const GOOGLE_CLIENT_ID = '425198427847-rfucr78mvnma3qv94pn9utas046svokk.apps.googleusercontent.com';

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

interface GoogleAuthConfig {
  client_id: string;
  callback: (response: any) => void;
  auto_select: boolean;
  cancel_on_tap_outside: boolean;
  use_fedcm_for_prompt: boolean;
  ux_mode: string;
  redirect_uri?: string;
}

export class GoogleAuthService {
  private static isInitialized = false;
  private static initializationPromise: Promise<void> | null = null;
  private static callbackHandler: ((response: any) => void) | null = null;
  private static fallbackMode = false;

  static async initialize(callbackHandler?: (response: any) => void): Promise<void> {
    if (this.isInitialized && !callbackHandler) return;
    if (this.initializationPromise && !callbackHandler) return this.initializationPromise;

    if (callbackHandler) {
      this.callbackHandler = callbackHandler;
    }

    this.initializationPromise = this.loadGoogleIdentityServices();
    await this.initializationPromise;
    
    // Try popup mode first, fallback to redirect on domain issues
    const config: GoogleAuthConfig = {
      client_id: GOOGLE_CLIENT_ID,
      callback: this.callbackHandler || this.defaultCallback,
      auto_select: false,
      cancel_on_tap_outside: false,
      use_fedcm_for_prompt: false,
      ux_mode: this.fallbackMode ? 'redirect' : 'popup'
    };

    // Only add redirect_uri if in redirect mode
    if (this.fallbackMode) {
      config.redirect_uri = window.location.origin + '/admin-login';
    }

    window.google?.accounts.id.initialize(config);

    this.isInitialized = true;
    console.log(`🔐 Google Identity Services initialized (${config.ux_mode} mode)`);
  }

  static enableFallbackMode(): void {
    this.fallbackMode = true;
    this.isInitialized = false;
    this.initializationPromise = null;
  }

  private static defaultCallback(response: any): void {
    console.log('🔐 Default callback received credential:', !!response.credential);
  }

  private static loadGoogleIdentityServices(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        const checkInterval = setInterval(() => {
          if (window.google?.accounts?.id) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);

        setTimeout(() => {
          clearInterval(checkInterval);
          if (!window.google?.accounts?.id) {
            reject(new Error('Google Identity Services API not available after timeout'));
          }
        }, 10000);
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Identity Services script'));
      };
      
      document.head.appendChild(script);
    });
  }

  static async promptSignIn(): Promise<void> {
    if (!this.isInitialized || !window.google?.accounts?.id) {
      throw this.createAuthError('initialization_failed', 'Google Identity Services is not properly initialized');
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(this.createAuthError('network_error', 'Sign-in request timed out after 30 seconds'));
      }, 30000);

      try {
        window.google!.accounts.id.prompt((notification: any) => {
          clearTimeout(timeoutId);
          
          if (notification.isNotDisplayed()) {
            const reason = notification.getNotDisplayedReason();
            console.log('🔐 Sign-in not displayed, reason:', reason);
            
            if (reason?.includes('invalid_client') || reason?.includes('unauthorized_domain')) {
              const domainError = this.createAuthError(
                'domain_unauthorized', 
                `Domain '${window.location.hostname}' is not authorized in Google Cloud Console`,
                `Add '${window.location.origin}' to Authorized JavaScript origins`
              );
              reject(domainError);
            } else if (reason?.includes('suppressed_by_user') || reason?.includes('browser_not_supported')) {
              reject(this.createAuthError('popup_blocked', 'Sign-in popup was blocked by browser settings'));
            } else {
              reject(this.createAuthError('unknown', `Sign-in could not be displayed: ${reason}`));
            }
          } else if (notification.isSkippedMoment()) {
            reject(this.createAuthError('user_cancelled', 'Sign-in was skipped by user'));
          } else if (notification.isDismissedMoment()) {
            reject(this.createAuthError('user_cancelled', 'Sign-in was dismissed by user'));
          } else {
            resolve();
          }
        });
      } catch (error) {
        clearTimeout(timeoutId);
        reject(this.createAuthError('unknown', error instanceof Error ? error.message : 'Unknown error during sign-in'));
      }
    });
  }

  static async renderButton(container: HTMLElement, customCallback?: (response: any) => void): Promise<void> {
    if (!this.isInitialized || !window.google?.accounts?.id) {
      throw this.createAuthError('initialization_failed', 'Google Identity Services is not available');
    }

    // Always use popup mode for button rendering to avoid domain issues
    if (customCallback) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: customCallback,
        auto_select: false,
        cancel_on_tap_outside: false,
        use_fedcm_for_prompt: false,
        ux_mode: 'popup'
      });
    }

    window.google.accounts.id.renderButton(container, {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: 280,
      locale: 'en'
    });
  }

  static parseCredential(credential: string): GoogleAuthUser {
    try {
      const payload = JSON.parse(atob(credential.split('.')[1]));
      return {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };
    } catch (error) {
      throw new Error('Invalid credential format');
    }
  }

  static disableAutoSelect(): void {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  }

  private static createAuthError(type: AuthenticationError['type'], message: string, details?: string): AuthenticationError {
    return {
      type,
      message,
      details: details || `Domain: ${window.location.hostname}, Protocol: ${window.location.protocol}`
    };
  }

  static getDiagnosticInfo(): Record<string, any> {
    return {
      isInitialized: this.isInitialized,
      fallbackMode: this.fallbackMode,
      googleAvailable: !!window.google?.accounts?.id,
      domain: window.location.hostname,
      origin: window.location.origin,
      protocol: window.location.protocol,
      userAgent: navigator.userAgent.substring(0, 100),
      cookiesEnabled: navigator.cookieEnabled,
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
    return {
      origins: [origin, 'https://localhost:5173'],
      redirects: [`${origin}/admin-login`, 'https://localhost:5173/admin-login']
    };
  }
}
