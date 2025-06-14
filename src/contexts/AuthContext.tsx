
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useAuthHandlers } from '@/hooks/useAuthHandlers';
import { useAuthInitialization } from '@/hooks/useAuthInitialization';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import { AuthenticationError } from '@/services/googleAuthService';

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
  domainConfig: { origins: string[], redirects: string[] };
  setAuthSuccessCallback: (callback: (() => void) | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  const [authSuccessCallback, setAuthSuccessCallback] = useState<(() => void) | null>(null);
  
  const authHandlers = useAuthHandlers(authSuccessCallback || undefined);
  const { isGoogleLoaded, diagnosticInfo, domainConfig, initializeAuth } = useAuthInitialization(
    authHandlers.handleCredentialResponse,
    authHandlers.debugLogger,
    authHandlers.setAuthError
  );
  
  const authOperations = useAuthOperations(
    isGoogleLoaded,
    authHandlers,
    initializeAuth,
    secureAuth
  );

  return (
    <AuthContext.Provider value={{
      user: secureAuth.user,
      isAuthenticated: secureAuth.isAuthenticated,
      isAdmin: secureAuth.isAdmin,
      isLoading: secureAuth.isLoading,
      error: authHandlers.authError?.message || secureAuth.error,
      authError: authHandlers.authError,
      signIn: authOperations.signIn,
      signInWithButton: authOperations.signInWithButton,
      signOut: authOperations.signOut,
      clearError: authOperations.clearError,
      debugInfo: authHandlers.debugLogger.getLogs(),
      clearCache: authOperations.clearCache,
      csrfToken: secureAuth.getCSRFToken(),
      validateSession: secureAuth.validateSession,
      diagnosticInfo,
      domainConfig,
      setAuthSuccessCallback,
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
