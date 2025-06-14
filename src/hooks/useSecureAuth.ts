
import { useState, useEffect, useCallback } from 'react';
import { SecureAuthService, SecureSession } from '@/services/secureAuthService';
import { googleAnalytics } from '@/utils/googleAnalytics';

export const useSecureAuth = () => {
  const [session, setSession] = useState<SecureSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!session;
  const isAdmin = session?.isAdmin || false;

  // Check for existing session on mount
  useEffect(() => {
    console.log('🔐 useSecureAuth - Initializing, checking for existing session');
    const existingSession = SecureAuthService.getSecureSession();
    if (existingSession) {
      console.log('🔐 useSecureAuth - Found existing session:', existingSession.email);
      setSession(existingSession);
      
      // Set user properties in Google Analytics
      googleAnalytics.setUserId(existingSession.email);
      googleAnalytics.setUserProperties({
        user_type: 'admin',
        user_email: existingSession.email
      });
    } else {
      console.log('🔐 useSecureAuth - No existing session found');
    }
    setIsLoading(false);
  }, []);

  // Monitor session changes with polling to catch immediate updates
  useEffect(() => {
    const checkSession = () => {
      const currentSession = SecureAuthService.getSecureSession();
      const currentSessionId = session?.sessionId;
      const newSessionId = currentSession?.sessionId;
      
      // Only update if session actually changed
      if (currentSessionId !== newSessionId) {
        console.log('🔐 useSecureAuth - Session change detected:', {
          oldSessionId: currentSessionId,
          newSessionId: newSessionId,
          isAuthenticated: !!currentSession
        });
        setSession(currentSession);
        
        if (currentSession) {
          // Set user properties in Google Analytics
          googleAnalytics.setUserId(currentSession.email);
          googleAnalytics.setUserProperties({
            user_type: 'admin',
            user_email: currentSession.email
          });
        }
      }
    };

    // Check immediately
    checkSession();
    
    // Then poll every 100ms for rapid updates during auth flow
    const interval = setInterval(checkSession, 100);
    
    return () => clearInterval(interval);
  }, [session?.sessionId]);

  // Auto-refresh session
  useEffect(() => {
    if (!session) return;

    const refreshInterval = setInterval(() => {
      const timeUntilExpiry = session.expiresAt - Date.now();
      const refreshThreshold = 60 * 60 * 1000; // 1 hour

      if (timeUntilExpiry < refreshThreshold && timeUntilExpiry > 0) {
        if (SecureAuthService.refreshSession()) {
          const refreshedSession = SecureAuthService.getSecureSession();
          if (refreshedSession) {
            setSession(refreshedSession);
            console.log('🔐 Session auto-refreshed');
          }
        }
      } else if (timeUntilExpiry <= 0) {
        // Session expired
        handleSignOut();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(refreshInterval);
  }, [session]);

  const handleSignOut = useCallback(() => {
    console.log('🔐 useSecureAuth - Signing out');
    SecureAuthService.clearSecureSession();
    setSession(null);
    setError(null);
    
    // Track admin logout event
    googleAnalytics.trackCustomEvent('admin_logout', {
      method: 'secure_session'
    });
    
    console.log('🔐 Secure sign-out complete');
  }, []);

  const establishSecureSession = useCallback((userData: any) => {
    console.log('🔐 useSecureAuth - Establishing secure session for:', userData.email);
    try {
      const sessionToken = SecureAuthService.generateSessionToken(userData);
      SecureAuthService.setSecureSession(sessionToken, userData);
      
      const newSession = SecureAuthService.getSecureSession();
      if (newSession) {
        console.log('🔐 useSecureAuth - Session established, updating context state');
        setSession(newSession);
        setError(null);
        
        // Set user properties in Google Analytics
        googleAnalytics.setUserId(userData.email);
        googleAnalytics.setUserProperties({
          user_type: 'admin',
          user_email: userData.email
        });
        
        // Track admin login event
        googleAnalytics.trackCustomEvent('admin_login', {
          method: 'secure_google',
          user_email: userData.email
        });
        
        console.log('🔐 useSecureAuth - Secure session established successfully, context updated');
        return true;
      }
      
      throw new Error('Failed to create secure session');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to establish secure session';
      setError(errorMsg);
      console.error('🔐 useSecureAuth - Secure session establishment failed:', error);
      return false;
    }
  }, []);

  const validateCurrentSession = useCallback((): boolean => {
    if (!session) return false;
    return SecureAuthService.validateSession(session.sessionId);
  }, [session]);

  const getCSRFToken = useCallback((): string | null => {
    return SecureAuthService.getCSRFToken();
  }, []);

  console.log('🔐 useSecureAuth - Current state:', { 
    isAuthenticated, 
    isAdmin, 
    isLoading, 
    sessionId: session?.sessionId,
    userEmail: session?.email 
  });

  return {
    session,
    user: session ? {
      email: session.email,
      name: session.name,
      picture: session.picture
    } : null,
    isAuthenticated,
    isAdmin,
    isLoading,
    error,
    establishSecureSession,
    signOut: handleSignOut,
    validateSession: validateCurrentSession,
    getCSRFToken,
    clearError: () => setError(null)
  };
};
