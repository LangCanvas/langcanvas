
const GOOGLE_CLIENT_ID = '425198427847-rfucr78mvnma3qv94pn9utas046svokk.apps.googleusercontent.com';

export interface GoogleAuthUser {
  email: string;
  name: string;
  picture?: string;
}

export class GoogleAuthService {
  private static isInitialized = false;
  private static initializationPromise: Promise<void> | null = null;

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initializationPromise) return this.initializationPromise;

    this.initializationPromise = this.loadGoogleIdentityServices();
    await this.initializationPromise;
    
    window.google?.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      auto_select: false,
      cancel_on_tap_outside: false,
      use_fedcm_for_prompt: false,
      ux_mode: 'popup',
      context: 'signin'
    });

    this.isInitialized = true;
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
        setTimeout(() => {
          if (window.google?.accounts?.id) {
            resolve();
          } else {
            reject(new Error('Google Identity Services API not available'));
          }
        }, 200);
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Identity Services'));
      };
      
      document.head.appendChild(script);

      setTimeout(() => {
        if (!window.google?.accounts?.id) {
          reject(new Error('Google Identity Services failed to load within timeout'));
        }
      }, 10000);
    });
  }

  static async promptSignIn(): Promise<void> {
    if (!this.isInitialized || !window.google?.accounts?.id) {
      throw new Error('Google Identity Services is not available');
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Sign-in timeout'));
      }, 30000);

      window.google!.accounts.id.prompt((notification: any) => {
        clearTimeout(timeoutId);
        
        if (notification.isNotDisplayed()) {
          reject(new Error('Sign-in prompt could not be displayed'));
        } else if (notification.isSkippedMoment()) {
          reject(new Error('Sign-in was skipped'));
        } else if (notification.isDismissedMoment()) {
          reject(new Error('Sign-in was cancelled by user'));
        } else {
          resolve();
        }
      });
    });
  }

  static async renderButton(container: HTMLElement): Promise<void> {
    if (!this.isInitialized || !window.google?.accounts?.id) {
      throw new Error('Google Identity Services is not available');
    }

    window.google.accounts.id.renderButton(container, {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: 250,
      locale: 'en'
    });
  }

  static parseCredential(credential: string): GoogleAuthUser {
    const payload = JSON.parse(atob(credential.split('.')[1]));
    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  }

  static disableAutoSelect(): void {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  }
}
