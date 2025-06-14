
import { GoogleAuthService } from '@/services/googleAuthService';
import { useAuthHandlers } from '@/hooks/useAuthHandlers';
import { useSecureAuth } from '@/hooks/useSecureAuth';

export const useSignOutOperations = (
  authHandlers: ReturnType<typeof useAuthHandlers>,
  secureAuth: ReturnType<typeof useSecureAuth>,
  initializeAuth: () => Promise<void>
) => {
  const { debugLogger, setAuthError, setRetryCount } = authHandlers;

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
    signOut,
    clearError,
    clearCache
  };
};
