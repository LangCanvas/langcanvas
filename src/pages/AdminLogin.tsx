
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, LogIn, Shield, Loader2, RefreshCw, AlertTriangle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ErrorHandler } from '@/components/admin/ErrorHandler';
import { TroubleshootingSection } from '@/components/admin/TroubleshootingSection';

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
    domainConfig
  } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDebug, setShowDebug] = useState(false);
  const [isAlternativeSignIn, setIsAlternativeSignIn] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin');
      toast({
        title: "Already Signed In",
        description: "You are already signed in to the admin dashboard.",
      });
    }
  }, [isAuthenticated, isAdmin, navigate, toast]);

  const handleSignIn = async () => {
    try {
      clearError();
      console.log('🔐 Enhanced admin login attempt started');
      await signIn();
      
      toast({
        title: "Welcome Back",
        description: "Successfully signed in to admin dashboard.",
      });
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
      console.log('🔐 Alternative enhanced admin login attempt started');
      await signInWithButton();
      
      toast({
        title: "Welcome Back",
        description: "Successfully signed in to admin dashboard.",
      });
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
    toast({
      title: "Cache Cleared",
      description: "Authentication cache has been cleared. Please try signing in again.",
    });
  };

  const getAuthErrorSeverity = () => {
    if (!authError) return 'low';
    
    switch (authError.type) {
      case 'domain_unauthorized':
      case 'initialization_failed':
        return 'high';
      case 'popup_blocked':
      case 'network_error':
        return 'medium';
      default:
        return 'low';
    }
  };

  const isDomainIssue = authError?.type === 'domain_unauthorized' || 
                        (authError?.message.includes('domain') && authError?.message.includes('unauthorized'));

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to LangCanvas
          </Button>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Admin Access</CardTitle>
            <CardDescription>
              Sign in to access the analytics dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {authError && <ErrorHandler error={authError.message} domainConfig={domainConfig} />}

            {/* Domain Configuration Warning */}
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

            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                This dashboard is restricted to authorized administrators only.
              </p>
              
              <Button 
                onClick={handleSignIn}
                disabled={isLoading || isDomainIssue}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign in with Google
                  </>
                )}
              </Button>

              {(error || authError) && !isDomainIssue && (
                <Button 
                  onClick={handleAlternativeSignIn}
                  disabled={isLoading || isAlternativeSignIn}
                  variant="outline"
                  className="w-full"
                >
                  {isAlternativeSignIn ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Trying Alternative...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Alternative Sign-in
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="text-xs text-muted-foreground text-center space-y-2">
              <p>Only bdevay@gmail.com is authorized to access this dashboard.</p>
              <p className="text-muted-foreground/60">
                Having trouble? Try the alternative sign-in method or check the troubleshooting section below.
              </p>
            </div>

            {/* Diagnostic Toggle */}
            {authError && (
              <div className="flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDiagnostics(!showDiagnostics)}
                >
                  <Info className="w-4 h-4 mr-1" />
                  {showDiagnostics ? 'Hide' : 'Show'} Diagnostics
                </Button>
              </div>
            )}

            {/* Diagnostic Details */}
            {showDiagnostics && (
              <div className="bg-muted p-3 rounded-md text-xs">
                <div className="font-medium mb-2">System Diagnostics:</div>
                <div className="space-y-1 font-mono">
                  <div>Domain: {diagnosticInfo.domain}</div>
                  <div>Protocol: {diagnosticInfo.protocol}</div>
                  <div>Google Available: {diagnosticInfo.googleAvailable ? 'Yes' : 'No'}</div>
                  <div>Cookies Enabled: {diagnosticInfo.cookiesEnabled ? 'Yes' : 'No'}</div>
                  <div>Third-party Storage: {diagnosticInfo.thirdPartyCookies ? 'Available' : 'Blocked'}</div>
                </div>
              </div>
            )}

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
