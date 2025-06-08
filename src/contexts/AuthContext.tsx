
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'bdevay@gmail.com';
const GOOGLE_CLIENT_ID = '1060424535135-t42df26dlsljoa1c68qqj3p267aeb0mf.apps.googleusercontent.com';

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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);

  const isAuthenticated = !!user;
  const isAdmin = user?.email === ADMIN_EMAIL;

  const addDebugInfo = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const newInfo = `[${timestamp}] ${message}`;
    console.log('🔐 DEBUG:', newInfo);
    setDebugInfo(prev => [...prev.slice(-9), newInfo]); // Keep last 10 entries
  };

  useEffect(() => {
    initializeGoogleAuth();
  }, []);

  const clearError = () => setError(null);

  const clearCache = () => {
    addDebugInfo('Clearing authentication cache...');
    localStorage.removeItem('langcanvas_auth_user');
    setUser(null);
    setError(null);
    setRetryCount(0);
    
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    
    // Force re-initialization
    setTimeout(() => {
      initializeGoogleAuth();
    }, 500);
  };

  const initializeGoogleAuth = async () => {
    addDebugInfo('Starting Google Auth initialization...');
    
    try {
      addDebugInfo(`Using Client ID: ${GOOGLE_CLIENT_ID.substring(0, 20)}...`);
      addDebugInfo(`Current domain: ${window.location.hostname}`);

      // Load Google Identity Services
      await loadGoogleIdentityServices();
      addDebugInfo('Google Identity Services loaded successfully');
      
      // Initialize Google Identity Services
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: false,
        use_fedcm_for_prompt: false, // Disable FedCM which can cause issues
      });

      setIsGoogleLoaded(true);
      addDebugInfo('Google Identity Services initialized successfully');

      // Try to restore session
      const storedUser = localStorage.getItem('langcanvas_auth_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          addDebugInfo(`Attempting to restore session for: ${userData.email}`);
          if (userData.email === ADMIN_EMAIL) {
            setUser(userData);
            addDebugInfo('User session restored successfully');
          } else {
            addDebugInfo('Stored user is not admin, clearing session');
            localStorage.removeItem('langcanvas_auth_user');
          }
        } catch (error) {
          addDebugInfo(`Failed to restore session: ${error}`);
          localStorage.removeItem('langcanvas_auth_user');
        }
      }
    } catch (error) {
      const errorMsg = `Failed to initialize Google Auth: ${error}`;
      addDebugInfo(errorMsg);
      setError('Failed to initialize authentication system. Please refresh the page and try again.');
    } finally {
      setIsLoading(false);
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
        // Wait a bit for the API to be ready
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

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!window.google?.accounts?.id) {
          addDebugInfo('Google Identity Services timeout');
          reject(new Error('Google Identity Services failed to load within timeout'));
        }
      }, 10000);
    });
  };

  const handleCredentialResponse = async (response: any) => {
    addDebugInfo('Received credential response from Google');
    
    try {
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }

      // Decode JWT token (simple decode, not verification)
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      addDebugInfo(`Decoded user info - Email: ${payload.email}, Name: ${payload.name}`);
      
      const userData: AuthUser = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };

      // Only allow admin user
      if (userData.email !== ADMIN_EMAIL) {
        addDebugInfo(`Access denied for user: ${userData.email}`);
        throw new Error(`Access denied. Only ${ADMIN_EMAIL} is authorized to access the admin dashboard.`);
      }

      setUser(userData);
      localStorage.setItem('langcanvas_auth_user', JSON.stringify(userData));
      setError(null);
      setRetryCount(0);
      addDebugInfo(`Authentication successful for: ${userData.email}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Authentication failed';
      addDebugInfo(`Authentication failed: ${errorMsg}`);
      setError(errorMsg);
      throw error;
    }
  };

  const signIn = async (): Promise<void> => {
    addDebugInfo(`Starting sign-in process (attempt ${retryCount + 1})...`);
    setError(null);
    
    try {
      if (!isGoogleLoaded) {
        throw new Error('Google Identity Services is not loaded. Please refresh the page and try again.');
      }

      if (!window.google?.accounts?.id) {
        throw new Error('Google Identity Services is not available. Please check your internet connection and try again.');
      }

      addDebugInfo('Showing Google Sign-In prompt...');
      
      // Create a promise to handle the async nature of the Google prompt
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          addDebugInfo('Sign-in timeout (30s)');
          reject(new Error('Sign-in timeout. Please try again or use the alternative sign-in method.'));
        }, 30000);

        // Show Google Sign-In prompt
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
      setError(errorMessage);
      setRetryCount(prev => prev + 1);
      throw new Error(errorMessage);
    }
  };

  const signInWithButton = async (): Promise<void> => {
    addDebugInfo('Starting alternative button-based sign-in...');
    setError(null);
    
    try {
      if (!isGoogleLoaded || !window.google?.accounts?.id) {
        throw new Error('Google Identity Services is not available');
      }

      // Create a temporary container for the button
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

        // Automatically click the button
        setTimeout(() => {
          const button = buttonContainer.querySelector('div[role="button"]') as HTMLElement;
          if (button) {
            addDebugInfo('Clicking alternative sign-in button...');
            button.click();
            
            // Clean up after a delay
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
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signOut = () => {
    addDebugInfo('Signing out...');
    setUser(null);
    setError(null);
    setRetryCount(0);
    localStorage.removeItem('langcanvas_auth_user');
    
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    addDebugInfo('Sign-out complete');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isAdmin,
      isLoading,
      error,
      signIn,
      signInWithButton,
      signOut,
      clearError,
      debugInfo,
      clearCache,
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
