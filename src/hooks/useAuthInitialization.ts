
import { useState, useEffect } from 'react';
import { GoogleAuthService } from '@/services/googleAuthService';
import { AuthenticationError } from '@/services/googleAuthService';
import { DebugLogger } from '@/utils/debugLogger';

export const useAuthInitialization = (
  handleCredentialResponse: (response: any) => Promise<void>,
  debugLogger: DebugLogger,
  setAuthError: (error: AuthenticationError | null) => void
) => {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [diagnosticInfo, setDiagnosticInfo] = useState<Record<string, any>>({});
  const [domainConfig, setDomainConfig] = useState({ origins: [], redirects: [] });

  const updateDiagnostics = () => {
    const diagnostics = GoogleAuthService.getDiagnosticInfo();
    const config = GoogleAuthService.getRequiredDomainConfig();
    setDiagnosticInfo(diagnostics);
    setDomainConfig(config);
    
    debugLogger.addLog(`Diagnostics - Google Available: ${diagnostics.googleAvailable}, Domain: ${diagnostics.domain}`);
  };

  const initializeAuth = async () => {
    debugLogger.addLog('Starting enhanced Google Auth initialization...');
    
    try {
      await GoogleAuthService.initialize(handleCredentialResponse);
      setIsGoogleLoaded(true);
      updateDiagnostics();
      debugLogger.addLog('Enhanced Google Identity Services initialized successfully');
      setAuthError(null);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown initialization error';
      debugLogger.addLog(`Failed to initialize Google Auth: ${errorMsg}`);
      
      // Update diagnostics even on failure to help with debugging
      updateDiagnostics();
      
      setAuthError({
        type: 'initialization_failed',
        message: 'Failed to initialize authentication system',
        details: errorMsg
      });
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  return {
    isGoogleLoaded,
    diagnosticInfo,
    domainConfig,
    initializeAuth
  };
};
