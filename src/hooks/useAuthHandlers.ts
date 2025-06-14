
import { useState } from 'react';
import { GoogleAuthService, GoogleAuthUser, AuthenticationError } from '@/services/googleAuthService';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { DebugLogger } from '@/utils/debugLogger';

const ADMIN_EMAIL = 'bdevay@gmail.com';

export const useAuthHandlers = (onAuthSuccess?: () => void) => {
  const secureAuth = useSecureAuth();
  const [debugLogger] = useState(() => new DebugLogger());
  const [authError, setAuthError] = useState<AuthenticationError | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleCredentialResponse = async (response: any) => {
    debugLogger.addLog('Received credential response from Google');
    
    try {
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }

      const userData: GoogleAuthUser = GoogleAuthService.parseCredential(response.credential);
      debugLogger.addLog(`Decoded user info - Email: ${userData.email}`);
      
      if (userData.email !== ADMIN_EMAIL) {
        debugLogger.addLog(`Access denied for user: ${userData.email}`);
        throw new Error(`Access denied. Only ${ADMIN_EMAIL} is authorized to access the admin dashboard.`);
      }

      const sessionEstablished = secureAuth.establishSecureSession(userData);
      if (!sessionEstablished) {
        throw new Error('Failed to establish secure session');
      }

      setAuthError(null);
      setRetryCount(0);
      debugLogger.addLog(`Enhanced authentication successful for: ${userData.email}`);
      
      // Immediate navigation trigger with more robust callback handling
      if (onAuthSuccess) {
        debugLogger.addLog('Triggering immediate navigation callback after successful authentication');
        // Use setTimeout to ensure state updates are processed
        setTimeout(() => {
          debugLogger.addLog('Executing delayed navigation callback');
          onAuthSuccess();
        }, 100);
      } else {
        debugLogger.addLog('Warning: No navigation callback provided');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Authentication failed';
      debugLogger.addLog(`Authentication failed: ${errorMsg}`);
      setAuthError({
        type: 'unknown',
        message: errorMsg,
        details: `Attempt ${retryCount + 1}`
      });
      throw error;
    }
  };

  return {
    handleCredentialResponse,
    debugLogger,
    authError,
    setAuthError,
    retryCount,
    setRetryCount
  };
};
