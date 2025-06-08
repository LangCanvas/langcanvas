
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { GoogleAuthService, GoogleAuthUser, AuthenticationError } from '@/services/googleAuthService';
import { DebugLogger } from '@/utils/debugLogger';

interface AuthUser {
  email: string;
  name: string;
  picture?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  authError: AuthenticationError | null;
  signIn: () => Promise<void>;
  signInWithButton: () => Promise<void>;
  signOut: () => void;
  clearError: () => void;
  debugInfo: string[];
  clearCache: () => void;
  csrfToken: string | null;
  validateSession: () => boolean;
  diagnosticInfo: Record<string, any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'bdevay@gmail.com';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const secureAuth = useSecureAuth();
  const [debugLogger] = useState(() => new DebugLogger());
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [authError, setAuthError] = useState<AuthenticationError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [diagnosticInfo, setDiagnosticInfo] = useState<Record<string, any>>({});

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    debugLogger.addLog('Starting enhanced Google Auth initialization...');
    
    try {
      await GoogleAuthService.initialize(handleCredentialResponse);
      setIsGoogleLoaded(true);
      setDiagnosticInfo(GoogleAuthService.getDiagnosticInfo());
      debugLogger.addLog('Enhanced Google Identity Services initialized successfully');
      setAuthError(null);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown initialization error';
      debugLogger.addLog(`Failed to initialize Google Auth: ${errorMsg}`);
      setAuthError({
        type: 'initialization_failed',
        message: 'Failed to initialize authentication system',
        details: errorMsg
      });
    }
  };

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
        setAuthError(error as AuthenticationError);
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

      // Wait a bit for the button to render, then simulate click
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
    setIsGoogleLoaded(false);
    GoogleAuthService.disableAutoSelect();
    
    // Clear any stored Google session data
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

  return (
    <AuthContext.Provider value={{
      user: secureAuth.user,
      isAuthenticated: secureAuth.isAuthenticated,
      isAdmin: secureAuth.isAdmin,
      isLoading: secureAuth.isLoading,
      error: authError?.message || secureAuth.error,
      authError,
      signIn,
      signInWithButton,
      signOut,
      clearError,
      debugInfo: debugLogger.getLogs(),
      clearCache,
      csrfToken: secureAuth.getCSRFToken(),
      validateSession: secureAuth.validateSession,
      diagnosticInfo,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Extend Window interface for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}
