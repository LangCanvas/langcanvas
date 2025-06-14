
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ErrorHandler } from '@/components/admin/ErrorHandler';
import { TroubleshootingSection } from '@/components/admin/TroubleshootingSection';
import { AdminLoginHeader } from '@/components/admin/AdminLoginHeader';
import { AdminLoginButtons } from '@/components/admin/AdminLoginButtons';
import { AdminLoginDiagnostics } from '@/components/admin/AdminLoginDiagnostics';

const AdminLogin = () => {
  const { 
    signIn, 
    signInWithButton, 
    isLoading, 
    error, 
    authError, 
    clearError, 
    isAuthenticated, 
    isAdmin, 
    debugInfo, 
    clearCache, 
    diagnosticInfo,
    domainConfig,
    setAuthSuccessCallback
  } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDebug, setShowDebug] = useState(false);
  const [isAlternativeSignIn, setIsAlternativeSignIn] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);
  const [navigationAttempts, setNavigationAttempts] = useState(0);

  // Enhanced redirect effect with retry mechanism
  useEffect(() => {
    console.log('🔐 AdminLogin auth state changed:', { 
      isAuthenticated, 
      isAdmin, 
      hasNavigated, 
      navigationAttempts 
    });
    
    if (isAuthenticated && isAdmin && !hasNavigated && navigationAttempts < 3) {
      console.log('🔐 User is authenticated and admin - triggering redirect');
      setHasNavigated(true);
      setNavigationAttempts(prev => prev + 1);
      
      // Small delay to ensure state is fully updated
      setTimeout(() => {
        navigate('/admin');
        toast({
          title: "Welcome Back",
          description: "Successfully signed in to admin dashboard.",
        });
      }, 100);
    }
  }, [isAuthenticated, isAdmin, navigate, toast, hasNavigated, navigationAttempts]);

  // Create navigation callback with retry mechanism
  const navigateToAdmin = useCallback(() => {
    console.log('🔐 Navigation callback triggered - checking auth state');
    console.log('🔐 Current auth state:', { 
      isAuthenticated, 
      isAdmin, 
      hasNavigated, 
      navigationAttempts 
    });
    
    // Only navigate if properly authenticated and haven't already navigated successfully
    if (isAuthenticated && isAdmin && !hasNavigated && navigationAttempts < 3) {
      console.log('🔐 Valid auth state confirmed - redirecting to admin dashboard');
      setHasNavigated(true);
      setNavigationAttempts(prev => prev + 1);
      
      // Delay navigation slightly to ensure context is fully updated
      setTimeout(() => {
        navigate('/admin');
        toast({
          title: "Welcome Back", 
          description: "Successfully signed in to admin dashboard.",
        });
      }, 150);
    } else {
      console.log('🔐 Navigation callback called but conditions not met:', {
        isAuthenticated,
        isAdmin,
        hasNavigated,
        navigationAttempts
      });
      
      // If auth state is valid but navigation failed, retry after a delay
      if (isAuthenticated && isAdmin && navigationAttempts < 3) {
        console.log('🔐 Retrying navigation after delay...');
        setTimeout(() => {
          setNavigationAttempts(prev => prev + 1);
        }, 500);
      }
    }
  }, [navigate, toast, isAuthenticated, isAdmin, hasNavigated, navigationAttempts]);

  // Set up the navigation callback with improved timing
  useEffect(() => {
    if (!isAuthenticated && !hasNavigated) {
      console.log('🔐 Setting up auth success callback in AdminLogin');
      setAuthSuccessCallback(navigateToAdmin);
      
      return () => {
        console.log('🔐 Cleaning up auth success callback');
        setAuthSuccessCallback(null);
      };
    }
  }, [setAuthSuccessCallback, navigateToAdmin, isAuthenticated, hasNavigated]);

  const handleSignIn = async () => {
    try {
      clearError();
      setHasNavigated(false);
      setNavigationAttempts(0);
      console.log('🔐 Enhanced admin login attempt started');
      await signIn();
    } catch (error) {
      console.error('🔐 Enhanced admin login failed:', error);
      
      if (!authError) {
        toast({
          title: "Sign In Failed",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleAlternativeSignIn = async () => {
    try {
      setIsAlternativeSignIn(true);
      clearError();
      setHasNavigated(false);
      setNavigationAttempts(0);
      console.log('🔐 Alternative enhanced admin login attempt started');
      await signInWithButton();
    } catch (error) {
      console.error('🔐 Alternative enhanced admin login failed:', error);
      
      if (!authError) {
        toast({
          title: "Alternative Sign In Failed",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsAlternativeSignIn(false);
    }
  };

  const handleClearCache = () => {
    clearCache();
    setHasNavigated(false);
    setNavigationAttempts(0);
    toast({
      title: "Cache Cleared",
      description: "Authentication cache has been cleared. Please try signing in again.",
    });
  };

  const isDomainIssue = authError?.type === 'domain_unauthorized' || 
                        (authError?.message.includes('domain') && authError?.message.includes('unauthorized'));

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <AdminLoginHeader />

        <Card>
          <CardContent className="space-y-4">
            {authError && <ErrorHandler error={authError.message} domainConfig={domainConfig} />}

            {isDomainIssue && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">
                    Domain Authorization Required
                  </span>
                </div>
                <p className="text-xs text-red-700 dark:text-red-300">
                  The administrator must add this domain to the Google Cloud Console OAuth configuration before login will work.
                </p>
              </div>
            )}

            <AdminLoginButtons
              onSignIn={handleSignIn}
              onAlternativeSignIn={handleAlternativeSignIn}
              isLoading={isLoading}
              isAlternativeSignIn={isAlternativeSignIn}
              isDomainIssue={isDomainIssue}
              hasError={!!(error || authError)}
            />

            <div className="text-xs text-muted-foreground text-center space-y-2">
              <p>Only privileged admin is authorized to access this dashboard.</p>
              <p className="text-muted-foreground/60">
                Having trouble? Try the alternative sign-in method or check the troubleshooting section below.
              </p>
            </div>

            <AdminLoginDiagnostics
              showDiagnostics={showDiagnostics}
              onToggleDiagnostics={() => setShowDiagnostics(!showDiagnostics)}
              diagnosticInfo={diagnosticInfo}
              hasAuthError={!!authError}
            />

            <TroubleshootingSection
              debugInfo={debugInfo}
              onClearCache={handleClearCache}
              showDebug={showDebug}
              onToggleDebug={setShowDebug}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
