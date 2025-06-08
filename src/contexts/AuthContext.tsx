
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
  signIn: () => Promise<void>;
  signOut: () => void;
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

  const isAuthenticated = !!user;
  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    initializeGoogleAuth();
  }, []);

  const initializeGoogleAuth = async () => {
    try {
      if (!GOOGLE_CLIENT_ID) {
        console.warn('Google Client ID not configured');
        setIsLoading(false);
        return;
      }

      // Load Google Identity Services
      await loadGoogleIdentityServices();
      
      // Initialize Google Identity Services
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
      });

      // Try to restore session
      const storedUser = localStorage.getItem('langcanvas_auth_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData.email === ADMIN_EMAIL) {
            setUser(userData);
          }
        } catch (error) {
          console.warn('Failed to restore user session:', error);
          localStorage.removeItem('langcanvas_auth_user');
        }
      }
    } catch (error) {
      console.error('Failed to initialize Google Auth:', error);
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

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  };

  const handleCredentialResponse = async (response: any) => {
    try {
      // Decode JWT token (simple decode, not verification)
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      const userData: AuthUser = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };

      // Only allow admin user
      if (userData.email !== ADMIN_EMAIL) {
        throw new Error('Access denied. Admin access required.');
      }

      setUser(userData);
      localStorage.setItem('langcanvas_auth_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  };

  const signIn = async (): Promise<void> => {
    try {
      if (!window.google?.accounts?.id) {
        throw new Error('Google Identity Services not loaded');
      }

      // Show Google Sign-In prompt
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.warn('Google Sign-In prompt was not displayed or skipped');
        }
      });
    } catch (error) {
      console.error('Sign-in failed:', error);
      throw error;
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('langcanvas_auth_user');
    
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isAdmin,
      isLoading,
      signIn,
      signOut,
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
