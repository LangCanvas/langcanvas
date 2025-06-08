
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
  signOut: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'bdevay@gmail.com';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

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

  const isAuthenticated = !!user;
  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    initializeGoogleAuth();
  }, []);

  const clearError = () => setError(null);

  const initializeGoogleAuth = async () => {
    console.log('🔐 Initializing Google Auth...');
    
    try {
      if (!GOOGLE_CLIENT_ID) {
        console.warn('⚠️ Google Client ID not configured - set VITE_GOOGLE_CLIENT_ID');
        setError('Google authentication is not configured. Please contact the administrator.');
        setIsLoading(false);
        return;
      }

      console.log('🔐 Google Client ID found:', GOOGLE_CLIENT_ID.substring(0, 20) + '...');

      // Load Google Identity Services
      await loadGoogleIdentityServices();
      console.log('✅ Google Identity Services loaded');
      
      // Initialize Google Identity Services
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: false,
      });

      setIsGoogleLoaded(true);
      console.log('✅ Google Identity Services initialized');

      // Try to restore session
      const storedUser = localStorage.getItem('langcanvas_auth_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          console.log('🔐 Attempting to restore user session for:', userData.email);
          if (userData.email === ADMIN_EMAIL) {
            setUser(userData);
            console.log('✅ User session restored');
          } else {
            console.warn('⚠️ Stored user is not admin, clearing session');
            localStorage.removeItem('langcanvas_auth_user');
          }
        } catch (error) {
          console.warn('⚠️ Failed to restore user session:', error);
          localStorage.removeItem('langcanvas_auth_user');
        }
      }
    } catch (error) {
      console.error('❌ Failed to initialize Google Auth:', error);
      setError('Failed to initialize authentication system. Please refresh the page and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadGoogleIdentityServices = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }

      console.log('📦 Loading Google Identity Services script...');
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('✅ Google Identity Services script loaded');
        // Wait a bit for the API to be ready
        setTimeout(() => resolve(), 100);
      };
      
      script.onerror = () => {
        console.error('❌ Failed to load Google Identity Services script');
        reject(new Error('Failed to load Google Identity Services'));
      };
      
      document.head.appendChild(script);

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!window.google?.accounts?.id) {
          reject(new Error('Google Identity Services failed to load within timeout'));
        }
      }, 10000);
    });
  };

  const handleCredentialResponse = async (response: any) => {
    console.log('🔐 Received credential response');
    
    try {
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }

      // Decode JWT token (simple decode, not verification)
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      console.log('🔐 Decoded user info:', { email: payload.email, name: payload.name });
      
      const userData: AuthUser = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };

      // Only allow admin user
      if (userData.email !== ADMIN_EMAIL) {
        console.warn('⚠️ Access denied for user:', userData.email);
        throw new Error(`Access denied. Only ${ADMIN_EMAIL} is authorized to access the admin dashboard.`);
      }

      setUser(userData);
      localStorage.setItem('langcanvas_auth_user', JSON.stringify(userData));
      setError(null);
      console.log('✅ Authentication successful for:', userData.email);
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      setError(error instanceof Error ? error.message : 'Authentication failed');
      throw error;
    }
  };

  const signIn = async (): Promise<void> => {
    console.log('🔐 Starting sign-in process...');
    setError(null);
    
    try {
      if (!isGoogleLoaded) {
        throw new Error('Google Identity Services is not loaded. Please refresh the page and try again.');
      }

      if (!window.google?.accounts?.id) {
        throw new Error('Google Identity Services is not available. Please check your internet connection and try again.');
      }

      console.log('🔐 Showing Google Sign-In prompt...');
      
      // Create a promise to handle the async nature of the Google prompt
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Sign-in timeout. Please try again.'));
        }, 30000); // 30 second timeout

        // Show Google Sign-In prompt
        window.google!.accounts.id.prompt((notification: any) => {
          clearTimeout(timeoutId);
          
          console.log('🔐 Google prompt notification:', notification);
          
          if (notification.isNotDisplayed()) {
            console.warn('⚠️ Google Sign-In prompt was not displayed');
            reject(new Error('Sign-in prompt could not be displayed. Please disable popup blockers and try again.'));
          } else if (notification.isSkippedMoment()) {
            console.warn('⚠️ Google Sign-In prompt was skipped');
            reject(new Error('Sign-in was cancelled. Please try again.'));
          } else if (notification.isDismissedMoment()) {
            console.warn('⚠️ Google Sign-In prompt was dismissed');
            reject(new Error('Sign-in was dismissed. Please try again.'));
          } else {
            // Success case is handled by handleCredentialResponse
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('❌ Sign-in failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sign-in failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signOut = () => {
    console.log('🔐 Signing out...');
    setUser(null);
    setError(null);
    localStorage.removeItem('langcanvas_auth_user');
    
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    console.log('✅ Sign-out complete');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isAdmin,
      isLoading,
      error,
      signIn,
      signOut,
      clearError,
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
          disableAutoSelect: () => void;
        };
      };
    };
  }
}
