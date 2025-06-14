
import { GOOGLE_CLIENT_ID, GoogleAuthConfig } from './googleAuthConfig';

export class GoogleAuthInitializer {
  private static isInitialized = false;
  private static initializationPromise: Promise<void> | null = null;
  private static callbackHandler: ((response: any) => void) | null = null;
  private static fallbackMode = false;
  private static retryCount = 0;
  private static maxRetries = 3;

  static async initialize(callbackHandler?: (response: any) => void): Promise<void> {
    if (this.isInitialized && !callbackHandler) return;
    if (this.initializationPromise && !callbackHandler) return this.initializationPromise;

    if (callbackHandler) {
      this.callbackHandler = callbackHandler;
    }

    // Debug logging for client ID verification
    console.log('🔐 Initializing Google Auth with Client ID:', GOOGLE_CLIENT_ID);
    console.log('🔐 Current domain:', window.location.hostname);
    console.log('🔐 Current origin:', window.location.origin);

    this.initializationPromise = this.initializeWithRetry();
    await this.initializationPromise;
  }

  private static async initializeWithRetry(): Promise<void> {
    while (this.retryCount < this.maxRetries) {
      try {
        await this.loadGoogleIdentityServices();
        await this.configureGoogleAuth();
        this.isInitialized = true;
        console.log(`🔐 Google Identity Services initialized successfully (attempt ${this.retryCount + 1})`);
        return;
      } catch (error) {
        this.retryCount++;
        console.warn(`🔐 Initialization attempt ${this.retryCount} failed:`, error);
        
        if (this.retryCount >= this.maxRetries) {
          throw new Error(`Failed to initialize Google Auth after ${this.maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, this.retryCount) * 1000));
      }
    }
  }

  private static async configureGoogleAuth(): Promise<void> {
    if (!window.google?.accounts?.id) {
      throw new Error('Google Identity Services not available');
    }

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

    console.log('🔐 Configuring Google Auth with config:', {
      client_id: config.client_id,
      ux_mode: config.ux_mode,
      use_fedcm_for_prompt: config.use_fedcm_for_prompt,
      redirect_uri: config.redirect_uri
    });

    window.google.accounts.id.initialize(config);
    console.log(`🔐 Google Auth configured (${config.ux_mode} mode)`);
  }

  static enableFallbackMode(): void {
    console.log('🔐 Enabling fallback mode for Google Auth');
    this.fallbackMode = true;
    this.isInitialized = false;
    this.initializationPromise = null;
    this.retryCount = 0;
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
        console.log('🔐 Google Identity Services already loaded');
        resolve();
        return;
      }

      console.log('🔐 Loading Google Identity Services script...');
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('🔐 Google Identity Services script loaded');
        const checkInterval = setInterval(() => {
          if (window.google?.accounts?.id) {
            console.log('🔐 Google Identity Services API available');
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
