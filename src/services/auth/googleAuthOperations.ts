
import { GoogleAuthUser, AuthenticationError, AuthErrorHandler } from './googleAuthConfig';

export class GoogleAuthOperations {
  static async promptSignIn(): Promise<void> {
    if (!window.google?.accounts?.id) {
      throw AuthErrorHandler.createAuthError('initialization_failed', 'Google Identity Services is not properly initialized');
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(AuthErrorHandler.createAuthError('network_error', 'Sign-in request timed out after 30 seconds'));
      }, 30000);

      try {
        window.google!.accounts.id.prompt((notification: any) => {
          clearTimeout(timeoutId);
          
          if (notification.isNotDisplayed()) {
            const reason = notification.getNotDisplayedReason();
            console.log('🔐 Sign-in not displayed, reason:', reason);
            
            if (reason?.includes('invalid_client') || reason?.includes('unauthorized_domain')) {
              const domainError = AuthErrorHandler.createAuthError(
                'domain_unauthorized', 
                `Domain '${window.location.hostname}' is not authorized in Google Cloud Console`,
                `Add '${window.location.origin}' to Authorized JavaScript origins`
              );
              reject(domainError);
            } else if (reason?.includes('suppressed_by_user') || reason?.includes('browser_not_supported')) {
              reject(AuthErrorHandler.createAuthError('popup_blocked', 'Sign-in popup was blocked by browser settings'));
            } else {
              reject(AuthErrorHandler.createAuthError('unknown', `Sign-in could not be displayed: ${reason}`));
            }
          } else if (notification.isSkippedMoment()) {
            reject(AuthErrorHandler.createAuthError('user_cancelled', 'Sign-in was skipped by user'));
          } else if (notification.isDismissedMoment()) {
            reject(AuthErrorHandler.createAuthError('user_cancelled', 'Sign-in was dismissed by user'));
          } else {
            resolve();
          }
        });
      } catch (error) {
        clearTimeout(timeoutId);
        reject(AuthErrorHandler.createAuthError('unknown', error instanceof Error ? error.message : 'Unknown error during sign-in'));
      }
    });
  }

  static async renderButton(container: HTMLElement, customCallback?: (response: any) => void): Promise<void> {
    if (!window.google?.accounts?.id) {
      throw AuthErrorHandler.createAuthError('initialization_failed', 'Google Identity Services is not available');
    }

    if (customCallback) {
      window.google.accounts.id.initialize({
        client_id: 'GOOGLE_CLIENT_ID',
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
}
