
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { GoogleAuthService, GoogleAuthUser } from '@/services/googleAuthService';
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
  signIn: () => Promise<void>;
  signInWithButton: () => Promise<void>;
  signOut: () => void;
  clearError: () => void;
  debugInfo: string[];
  clearCache: () => void;
  csrfToken: string | null;
  validateSession: () => boolean;
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
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    debugLogger.addLog('Starting secure Google Auth initialization...');
    
    try {
      await GoogleAuthService.initialize();
      
      // Set up the credential callback
      window.google?.accounts.id.initialize({
        client_id: '425198427847-rfucr78mvnma3qv94pn9utas046svokk.apps.googleusercontent.com',
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: false,
        use_fedcm_for_prompt: false,
        ux_mode: 'popup',
        context: 'signin'
      });

      setIsGoogleLoaded(true);
      debugLogger.addLog('Secure Google Identity Services initialized successfully');
    } catch (error) {
      debugLogger.addLog(`Failed to initialize Google Auth: ${error}`);
      setGoogleError('Failed to initialize authentication system');
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

      setGoogleError(null);
      setRetryCount(0);
      debugLogger.addLog(`Secure authentication successful for: ${userData.email}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Authentication failed';
      debugLogger.addLog(`Authentication failed: ${errorMsg}`);
      setGoogleError(errorMsg);
      throw error;
    }
  };

  const signIn = async (): Promise<void> => {
    debugLogger.addLog(`Starting secure sign-in process (attempt ${retryCount + 1})...`);
    setGoogleError(null);
    
    try {
      if (!isGoogleLoaded) {
        throw new Error('Google Identity Services is not loaded');
      }

      await GoogleAuthService.promptSignIn();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign-in failed';
      debugLogger.addLog(`Sign-in failed: ${errorMessage}`);
      setGoogleError(errorMessage);
      setRetryCount(prev => prev + 1);
      throw new Error(errorMessage);
    }
  };

  const signInWithButton = async (): Promise<void> => {
    debugLogger.addLog('Starting alternative button-based secure sign-in...');
    setGoogleError(null);
    
    try {
      const buttonContainer = document.createElement('div');
      buttonContainer.style.position = 'absolute';
      buttonContainer.style.top = '-9999px';
      buttonContainer.id = 'temp-google-signin-button';
      document.body.appendChild(buttonContainer);

      await GoogleAuthService.renderButton(buttonContainer);

      setTimeout(() => {
        const button = buttonContainer.querySelector('div[role="button"]') as HTMLElement;
        if (button) {
          debugLogger.addLog('Clicking alternative sign-in button...');
          button.click();
          
          setTimeout(() => {
            if (document.body.contains(buttonContainer)) {
              document.body.removeChild(buttonContainer);
            }
          }, 1000);
        }
      }, 500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Alternative sign-in failed';
      debugLogger.addLog(`Alternative sign-in failed: ${errorMessage}`);
      setGoogleError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signOut = () => {
    debugLogger.addLog('Secure sign-out initiated...');
    secureAuth.signOut();
    setGoogleError(null);
    setRetryCount(0);
    GoogleAuthService.disableAutoSelect();
    debugLogger.addLog('Secure sign-out complete');
  };

  const clearError = () => {
    setGoogleError(null);
    secureAuth.clearError();
  };

  const clearCache = () => {
    debugLogger.addLog('Clearing authentication cache...');
    secureAuth.signOut();
    setGoogleError(null);
    setRetryCount(0);
    GoogleAuthService.disableAutoSelect();
    
    setTimeout(() => {
      initializeAuth();
    }, 500);
  };

  return (
    <AuthContext.Provider value={{
      user: secureAuth.user,
      isAuthenticated: secureAuth.isAuthenticated,
      isAdmin: secureAuth.isAdmin,
      isLoading: secureAuth.isLoading,
      error: googleError || secureAuth.error,
      signIn,
      signInWithButton,
      signOut,
      clearError,
      debugInfo: debugLogger.getLogs(),
      clearCache,
      csrfToken: secureAuth.getCSRFToken(),
      validateSession: secureAuth.validateSession,
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
