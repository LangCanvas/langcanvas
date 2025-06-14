
import { GoogleAuthService } from '@/services/googleAuthService';
import { useAuthHandlers } from '@/hooks/useAuthHandlers';
import { useSecureAuth } from '@/hooks/useSecureAuth';

export const useSignInOperations = (
  isGoogleLoaded: boolean,
  authHandlers: ReturnType<typeof useAuthHandlers>,
  initializeAuth: () => Promise<void>
) => {
  const { debugLogger, authError, setAuthError, retryCount, setRetryCount } = authHandlers;

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
          debugLogger.addLog('One Tap suppressed - this is expected, user should use button-based sign-in');
          // Don't throw error for suppressed One Tap, it's expected behavior
          return;
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

  return { signIn };
};
