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
        
        // Handle specific error types with automatic fallback for suppressed One Tap
        if (authErr.type === 'user_cancelled' && 
            (authErr.details?.includes('suppressed_by_user') || 
             authErr.details?.includes('opt_out_or_no_session') ||
             authErr.message?.includes('disabled in your browser'))) {
          debugLogger.addLog('One Tap suppressed - automatically trying button-based sign-in...');
          // Don't increment retry count for this specific error, just fall back to button
          try {
            await signInWithButton();
            return; // Success via button, don't throw
          } catch (buttonError) {
            debugLogger.addLog('Button-based fallback also failed');
            // Let the original error propagate
          }
        } else if (authErr.type === 'domain_unauthorized' && retryCount < 2) {
          debugLogger.addLog('Enabling fallback mode for domain authorization issues...');
          GoogleAuthService.enableFallbackMode();
          await initializeAuth();
          setRetryCount(prev => prev + 1);
        } else {
          setRetryCount(prev => prev + 1);
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Sign-in failed';
        setAuthError({
          type: 'unknown',
          message: errorMessage,
          details: `Domain: ${window.location.hostname}, Attempt: ${retryCount + 1}`
        });
        setRetryCount(prev => prev + 1);
      }
      
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
      buttonContainer.style.width = '320px';
      buttonContainer.style.height = '60px';
      buttonContainer.style.zIndex = '9999';
      buttonContainer.id = 'temp-google-signin-button';
      document.body.appendChild(buttonContainer);

      // Render the button and wait for it to be ready
      await GoogleAuthService.renderButton(buttonContainer, handleCredentialResponse);
      
      debugLogger.addLog('Button rendered successfully, attempting to click...');
      
      // Since renderButton() completed successfully, we know the button is ready
      // Find and click the button immediately
      const buttonSelectors = [
        'div[role="button"]',
        'button',
        '[data-idom-class]',
        '.gsi-material-button',
        'div[tabindex="0"]',
        'div[jsaction]'
      ];
      
      let buttonElement: HTMLElement | null = null;
      
      for (const selector of buttonSelectors) {
        buttonElement = buttonContainer.querySelector(selector) as HTMLElement;
        if (buttonElement) {
          debugLogger.addLog(`Found button with selector: ${selector}`);
          break;
        }
      }
      
      if (!buttonElement) {
        throw new Error('Button element not found in container after successful rendering');
      }

      // Click the button with multiple event types to ensure compatibility
      const clickEvents = ['mousedown', 'mouseup', 'click'];
      
      for (const eventType of clickEvents) {
        const event = new MouseEvent(eventType, {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: buttonElement.offsetLeft + buttonElement.offsetWidth / 2,
          clientY: buttonElement.offsetTop + buttonElement.offsetHeight / 2
        });
        buttonElement.dispatchEvent(event);
      }
      
      // Also try focus and keyboard activation
      if (buttonElement.focus) {
        buttonElement.focus();
      }
      
      const keyboardEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        bubbles: true,
        cancelable: true
      });
      buttonElement.dispatchEvent(keyboardEvent);
      
      debugLogger.addLog('Button click events dispatched successfully');
      
      // Clean up the temporary container after a delay
      setTimeout(() => {
        if (document.body.contains(buttonContainer)) {
          document.body.removeChild(buttonContainer);
          debugLogger.addLog('Temporary button container cleaned up');
        }
      }, 8000);
      
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
    
    // Clear Google-related cookies
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
    
    // Clear local storage items related to Google Auth
    try {
      localStorage.removeItem('g_state');
      sessionStorage.removeItem('g_state');
    } catch (error) {
      debugLogger.addLog('Could not clear One Tap preferences');
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
