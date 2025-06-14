
import { GOOGLE_CLIENT_ID, GoogleAuthUser, AuthenticationError, AuthErrorHandler } from './googleAuthConfig';

export class GoogleAuthOperations {
  static async promptSignIn(): Promise<void> {
    console.log('🔐 Starting Google Auth prompt sign-in...');
    
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
          
          console.log('🔐 Google Auth prompt notification:', {
            isNotDisplayed: notification.isNotDisplayed?.(),
            isSkippedMoment: notification.isSkippedMoment?.(),
            isDismissedMoment: notification.isDismissedMoment?.(),
            notDisplayedReason: notification.getNotDisplayedReason?.()
          });
          
          if (notification.isNotDisplayed()) {
            const reason = notification.getNotDisplayedReason();
            console.log('🔐 Sign-in not displayed, reason:', reason);
            
            if (reason?.includes('invalid_client') || reason?.includes('unauthorized_domain')) {
              const domainError = AuthErrorHandler.createAuthError(
                'domain_unauthorized', 
                `Domain '${window.location.hostname}' is not authorized in Google Cloud Console`,
                `Current origin: ${window.location.origin}`
              );
              reject(domainError);
            } else if (reason?.includes('suppressed_by_user') || reason === 'suppressed_by_user') {
              reject(AuthErrorHandler.createAuthError(
                'user_cancelled', 
                'Google One Tap is disabled in your browser. Please use the sign-in button below.',
                'One Tap has been suppressed by user settings or browser policy'
              ));
            } else if (reason?.includes('browser_not_supported')) {
              reject(AuthErrorHandler.createAuthError('popup_blocked', 'Browser does not support One Tap. Please use the sign-in button below.'));
            } else if (reason === 'opt_out_or_no_session') {
              reject(AuthErrorHandler.createAuthError(
                'user_cancelled', 
                'Google One Tap is not available. Please use the alternative sign-in button below.',
                'User has opted out of One Tap or has no active Google session'
              ));
            } else {
              reject(AuthErrorHandler.createAuthError('unknown', `Sign-in could not be displayed: ${reason || 'unknown_reason'}`));
            }
          } else if (notification.isSkippedMoment()) {
            reject(AuthErrorHandler.createAuthError('user_cancelled', 'Sign-in was skipped by user'));
          } else if (notification.isDismissedMoment()) {
            reject(AuthErrorHandler.createAuthError('user_cancelled', 'Sign-in was dismissed by user'));
          } else {
            console.log('🔐 Google Auth prompt displayed successfully');
            resolve();
          }
        });
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('🔐 Error during Google Auth prompt:', error);
        reject(AuthErrorHandler.createAuthError('unknown', error instanceof Error ? error.message : 'Unknown error during sign-in'));
      }
    });
  }

  static async renderButton(container: HTMLElement, customCallback?: (response: any) => void): Promise<void> {
    console.log('🔐 Rendering Google Auth button...');
    
    if (!window.google?.accounts?.id) {
      throw AuthErrorHandler.createAuthError('initialization_failed', 'Google Identity Services is not available');
    }

    if (customCallback) {
      console.log('🔐 Re-initializing Google Auth for button with custom callback');
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
    
    console.log('🔐 Google Auth button rendered successfully');
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

  static resetOneTapPreferences(): void {
    if (window.google?.accounts?.id) {
      // Clear any stored One Tap preferences
      try {
        localStorage.removeItem('g_state');
        sessionStorage.removeItem('g_state');
        console.log('🔐 One Tap preferences cleared');
      } catch (error) {
        console.warn('🔐 Could not clear One Tap preferences:', error);
      }
    }
  }
}
