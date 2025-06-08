
import { GOOGLE_CLIENT_ID, GoogleAuthConfig } from './googleAuthConfig';

export class GoogleAuthInitializer {
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
    
    const config: GoogleAuthConfig = {
      client_id: GOOGLE_CLIENT_ID,
      callback: this.callbackHandler || this.defaultCallback,
      auto_select: false,
      cancel_on_tap_outside: false,
      use_fedcm_for_prompt: false,
      ux_mode: this.fallbackMode ? 'redirect' : 'popup'
    };

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

  static get initialized(): boolean {
    return this.isInitialized;
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
}
