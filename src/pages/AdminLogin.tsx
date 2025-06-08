
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, LogIn, Shield, AlertCircle, Loader2, Bug, RefreshCw, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const AdminLogin = () => {
  const { signIn, signInWithButton, isLoading, error, clearError, isAuthenticated, isAdmin, debugInfo, clearCache } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDebug, setShowDebug] = useState(false);
  const [isAlternativeSignIn, setIsAlternativeSignIn] = useState(false);

  // Redirect if already authenticated as admin
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
      console.log('🔐 Admin login attempt started');
      await signIn();
      
      // Success - navigation will be handled by the useEffect above
      toast({
        title: "Welcome Back",
        description: "Successfully signed in to admin dashboard.",
      });
    } catch (error) {
      console.error('🔐 Admin login failed:', error);
      
      // Error is already set in the auth context, but we'll also show a toast
      toast({
        title: "Sign In Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAlternativeSignIn = async () => {
    try {
      setIsAlternativeSignIn(true);
      clearError();
      console.log('🔐 Alternative admin login attempt started');
      await signInWithButton();
      
      toast({
        title: "Welcome Back",
        description: "Successfully signed in to admin dashboard.",
      });
    } catch (error) {
      console.error('🔐 Alternative admin login failed:', error);
      
      toast({
        title: "Alternative Sign In Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
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

  const getErrorMessage = (error: string) => {
    if (error.includes('not configured')) {
      return 'Authentication is not properly configured. Please contact the system administrator.';
    }
    if (error.includes('popup blockers') || error.includes('not displayed')) {
      return 'Sign-in popup was blocked or couldn\'t be displayed. Please disable popup blockers and try the alternative sign-in method below.';
    }
    if (error.includes('Access denied')) {
      return error; // Show the specific access denied message
    }
    if (error.includes('cancelled') || error.includes('dismissed')) {
      return 'Sign-in was cancelled. Please try again to access the admin dashboard.';
    }
    if (error.includes('timeout')) {
      return 'Sign-in timed out. Please check your internet connection and try again.';
    }
    if (error.includes('domain authorization')) {
      return 'Domain authorization issue. The current domain may not be authorized in Google Cloud Console.';
    }
    return error;
  };

  const getDomainHelp = () => {
    const currentDomain = window.location.hostname;
    return (
      <div className="text-xs text-muted-foreground space-y-2">
        <p><strong>Current domain:</strong> {currentDomain}</p>
        <p>If you're the administrator, ensure this domain is added to "Authorized JavaScript origins" in Google Cloud Console for the OAuth 2.0 client.</p>
      </div>
    );
  };

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
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>{getErrorMessage(error)}</p>
                    {(error.includes('not displayed') || error.includes('domain')) && getDomainHelp()}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                This dashboard is restricted to authorized administrators only.
              </p>
              
              <Button 
                onClick={handleSignIn}
                disabled={isLoading}
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

              {error && (
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

            {/* Troubleshooting Section */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Troubleshooting</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDebug(!showDebug)}
                >
                  <Bug className="w-4 h-4 mr-1" />
                  {showDebug ? 'Hide' : 'Show'} Debug
                </Button>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleClearCache}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Clear Cache & Retry
                </Button>
              </div>

              {showDebug && (
                <div className="bg-muted p-3 rounded-md">
                  <div className="text-xs font-medium mb-2">Debug Information:</div>
                  <div className="space-y-1 text-xs font-mono">
                    {debugInfo.length > 0 ? (
                      debugInfo.map((info, index) => (
                        <div key={index} className="text-muted-foreground">
                          {info}
                        </div>
                      ))
                    ) : (
                      <div className="text-muted-foreground">No debug information yet</div>
                    )}
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                <p><strong>Common solutions:</strong></p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Disable popup blockers for this site</li>
                  <li>Clear browser cache and cookies</li>
                  <li>Try a different browser or incognito mode</li>
                  <li>Check internet connectivity</li>
                  <li>Contact administrator if domain issues persist</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
