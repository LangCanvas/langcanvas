
import { GoogleAuthService } from '@/services/googleAuthService';
import { useAuthHandlers } from '@/hooks/useAuthHandlers';
import { useSecureAuth } from '@/hooks/useSecureAuth';

export const useAuthOperations = (
  isGoogleLoaded: boolean,
  authHandlers: ReturnType<typeof useAuthHandlers>,
  initializeAuth: () => Promise<void>,
  secureAuth: ReturnType<typeof useSecureAuth>
) => {
  const { debugLogger, authError, setAuthError, retryCount, setRetryCount, handleCredentialResponse } = authHandlers;

  const signIn = async (): Promise<void> => {
    debugLogger.addLog(`Starting enhanced sign-in process (attempt ${retryCount + 1})...`);
    setAuthError(null);
    
    try {
      if (!isGoogleLoaded) {
        throw new Error('Google Identity Services is not loaded. Please refresh the page.');
      }

      await GoogleAuthService.promptSignIn();
    } catch (error) {
      const isAuthError = error && typeof error === 'object' && 'type' in error;
      
      if (isAuthError) {
        const authErr = error as any;
        setAuthError(authErr);
        
        if (authErr.type === 'domain_unauthorized' && retryCount < 2) {
          debugLogger.addLog('Enabling fallback mode for domain authorization issues...');
          GoogleAuthService.enableFallbackMode();
          await initializeAuth();
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Sign-in failed';
        setAuthError({
          type: 'unknown',
          message: errorMessage,
          details: `Domain: ${window.location.hostname}, Attempt: ${retryCount + 1}`
        });
      }
      
      setRetryCount(prev => prev + 1);
      debugLogger.addLog(`Sign-in failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  const signInWithButton = async (): Promise<void> => {
    debugLogger.addLog('Starting alternative button-based enhanced sign-in...');
    setAuthError(null);
    
    try {
      const buttonContainer = document.createElement('div');
      buttonContainer.style.position = 'absolute';
      buttonContainer.style.top = '-9999px';
      buttonContainer.style.left = '-9999px';
      buttonContainer.id = 'temp-google-signin-button';
      document.body.appendChild(buttonContainer);

      await GoogleAuthService.renderButton(buttonContainer, handleCredentialResponse);

      setTimeout(() => {
        const button = buttonContainer.querySelector('div[role="button"]') as HTMLElement;
        if (button) {
          debugLogger.addLog('Clicking alternative sign-in button...');
          button.click();
        } else {
          debugLogger.addLog('Button not found in container');
          throw new Error('Sign-in button could not be rendered');
        }
        
        setTimeout(() => {
          if (document.body.contains(buttonContainer)) {
            document.body.removeChild(buttonContainer);
          }
        }, 2000);
      }, 800);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Alternative sign-in failed';
      debugLogger.addLog(`Alternative sign-in failed: ${errorMessage}`);
      setAuthError({
        type: 'unknown',
        message: errorMessage,
        details: 'Button-based authentication attempt'
      });
      throw new Error(errorMessage);
    }
  };

  const signOut = () => {
    debugLogger.addLog('Enhanced sign-out initiated...');
    secureAuth.signOut();
    setAuthError(null);
    setRetryCount(0);
    GoogleAuthService.disableAutoSelect();
    debugLogger.addLog('Enhanced sign-out complete');
  };

  const clearError = () => {
    setAuthError(null);
    secureAuth.clearError();
  };

  const clearCache = () => {
    debugLogger.addLog('Clearing authentication cache...');
    secureAuth.signOut();
    setAuthError(null);
    setRetryCount(0);
    GoogleAuthService.disableAutoSelect();
    
    try {
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        if (name.trim().includes('google') || name.trim().includes('oauth')) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        }
      });
    } catch (error) {
      debugLogger.addLog('Could not clear all cookies');
    }
    
    setTimeout(() => {
      initializeAuth();
    }, 1000);
  };

  return {
    signIn,
    signInWithButton,
    signOut,
    clearError,
    clearCache
  };
};
