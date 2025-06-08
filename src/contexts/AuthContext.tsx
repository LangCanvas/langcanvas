import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { firestoreAnalytics } from '@/utils/firestoreAnalytics';

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
const GOOGLE_CLIENT_ID = '425198427847-rfucr78mvnma3qv94pn9utas046svokk.apps.googleusercontent.com';

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
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const addDebugInfo = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const newInfo = `[${timestamp}] ${message}`;
    console.log('🔐 DEBUG:', newInfo);
    setDebugInfo(prev => [...prev.slice(-9), newInfo]);
  };

  useEffect(() => {
    initializeGoogleAuth();
  }, []);

  const clearError = () => {
    setGoogleError(null);
    secureAuth.clearError();
  };

  const clearCache = () => {
    addDebugInfo('Clearing authentication cache...');
    secureAuth.signOut();
    setGoogleError(null);
    setRetryCount(0);
    
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    
    setTimeout(() => {
      initializeGoogleAuth();
    }, 500);
  };

  const initializeGoogleAuth = async () => {
    addDebugInfo('Starting secure Google Auth initialization...');
    
    try {
      addDebugInfo(`Using Client ID: ${GOOGLE_CLIENT_ID.substring(0, 20)}...`);
      addDebugInfo(`Current domain: ${window.location.hostname}`);
      addDebugInfo(`Environment: ${window.location.hostname.includes('lovable.dev') ? 'development' : 'production'}`);

      await loadGoogleIdentityServices();
      addDebugInfo('Google Identity Services loaded successfully');

      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: false,
        use_fedcm_for_prompt: false,
        ux_mode: 'popup',
        context: 'signin'
      });

      setIsGoogleLoaded(true);
      addDebugInfo('Secure Google Identity Services initialized successfully');
    } catch (error) {
      const errorMsg = `Failed to initialize Google Auth: ${error}`;
      addDebugInfo(errorMsg);
      setGoogleError('Failed to initialize authentication system. Please refresh the page and try again.');
    }
  };

  const loadGoogleIdentityServices = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.id) {
        addDebugInfo('Google Identity Services already loaded');
        resolve();
        return;
      }

      addDebugInfo('Loading Google Identity Services script...');
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        addDebugInfo('Google Identity Services script loaded');
        setTimeout(() => {
          if (window.google?.accounts?.id) {
            addDebugInfo('Google Identity Services API is ready');
            resolve();
          } else {
            addDebugInfo('Google Identity Services API not available after script load');
            reject(new Error('Google Identity Services API not available'));
          }
        }, 200);
      };
      
      script.onerror = () => {
        addDebugInfo('Failed to load Google Identity Services script');
        reject(new Error('Failed to load Google Identity Services'));
      };
      
      document.head.appendChild(script);

      setTimeout(() => {
        if (!window.google?.accounts?.id) {
          addDebugInfo('Google Identity Services timeout');
          reject(new Error('Google Identity Services failed to load within timeout'));
        }
      }, 10000);
    });
  };

  const handleCredentialResponse = async (response: any) => {
    addDebugInfo('Received credential response from Google - establishing secure session');
    
    try {
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }

      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      addDebugInfo(`Decoded user info - Email: ${payload.email}, Name: ${payload.name}`);
      
      const userData: AuthUser = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };

      if (userData.email !== ADMIN_EMAIL) {
        addDebugInfo(`Access denied for user: ${userData.email}`);
        throw new Error(`Access denied. Only ${ADMIN_EMAIL} is authorized to access the admin dashboard.`);
      }

      // Establish secure session instead of localStorage
      const sessionEstablished = secureAuth.establishSecureSession(userData);
      if (!sessionEstablished) {
        throw new Error('Failed to establish secure session');
      }

      setGoogleError(null);
      setRetryCount(0);
      addDebugInfo(`Secure authentication successful for: ${userData.email}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Authentication failed';
      addDebugInfo(`Authentication failed: ${errorMsg}`);
      setGoogleError(errorMsg);
      throw error;
    }
  };

  const signIn = async (): Promise<void> => {
    addDebugInfo(`Starting secure sign-in process (attempt ${retryCount + 1})...`);
    setGoogleError(null);
    
    try {
      if (!isGoogleLoaded) {
        throw new Error('Google Identity Services is not loaded. Please refresh the page and try again.');
      }

      if (!window.google?.accounts?.id) {
        throw new Error('Google Identity Services is not available. Please check your internet connection and try again.');
      }

      addDebugInfo('Showing Google Sign-In prompt...');
      
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          addDebugInfo('Sign-in timeout (30s)');
          reject(new Error('Sign-in timeout. Please try again or use the alternative sign-in method.'));
        }, 30000);

        window.google!.accounts.id.prompt((notification: any) => {
          clearTimeout(timeoutId);
          
          addDebugInfo(`Google prompt notification: ${JSON.stringify(notification)}`);
          
          if (notification.isNotDisplayed()) {
            addDebugInfo('Google Sign-In prompt was not displayed');
            setRetryCount(prev => prev + 1);
            reject(new Error('Sign-in prompt could not be displayed. This might be due to popup blockers or domain authorization issues. Please try the alternative sign-in method below.'));
          } else if (notification.isSkippedMoment()) {
            addDebugInfo('Google Sign-In prompt was skipped');
            reject(new Error('Sign-in was skipped. Please try again or use the alternative sign-in method.'));
          } else if (notification.isDismissedMoment()) {
            addDebugInfo('Google Sign-In prompt was dismissed by user');
            reject(new Error('Sign-in was cancelled by user. Please try again.'));
          } else {
            addDebugInfo('Google prompt showed successfully');
            resolve();
          }
        });
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign-in failed. Please try again.';
      addDebugInfo(`Sign-in failed: ${errorMessage}`);
      setGoogleError(errorMessage);
      setRetryCount(prev => prev + 1);
      throw new Error(errorMessage);
    }
  };

  const signInWithButton = async (): Promise<void> => {
    addDebugInfo('Starting alternative button-based secure sign-in...');
    setGoogleError(null);
    
    try {
      if (!isGoogleLoaded || !window.google?.accounts?.id) {
        throw new Error('Google Identity Services is not available');
      }

      const buttonContainer = document.createElement('div');
      buttonContainer.style.position = 'absolute';
      buttonContainer.style.top = '-9999px';
      buttonContainer.id = 'temp-google-signin-button';
      document.body.appendChild(buttonContainer);

      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          document.body.removeChild(buttonContainer);
          reject(new Error('Alternative sign-in timeout'));
        }, 30000);

        window.google!.accounts.id.renderButton(buttonContainer, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: 250,
          locale: 'en'
        });

        setTimeout(() => {
          const button = buttonContainer.querySelector('div[role="button"]') as HTMLElement;
          if (button) {
            addDebugInfo('Clicking alternative sign-in button...');
            button.click();
            
            setTimeout(() => {
              if (document.body.contains(buttonContainer)) {
                document.body.removeChild(buttonContainer);
              }
              clearTimeout(timeoutId);
              resolve();
            }, 1000);
          } else {
            clearTimeout(timeoutId);
            document.body.removeChild(buttonContainer);
            reject(new Error('Failed to create alternative sign-in button'));
          }
        }, 500);
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Alternative sign-in failed';
      addDebugInfo(`Alternative sign-in failed: ${errorMessage}`);
      setGoogleError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signOut = () => {
    addDebugInfo('Secure sign-out initiated...');
    secureAuth.signOut();
    setGoogleError(null);
    setRetryCount(0);
    
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    addDebugInfo('Secure sign-out complete');
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
      debugInfo,
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
