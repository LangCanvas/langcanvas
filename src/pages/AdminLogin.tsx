
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, LogIn, Shield, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ErrorHandler } from '@/components/admin/ErrorHandler';
import { TroubleshootingSection } from '@/components/admin/TroubleshootingSection';

const AdminLogin = () => {
  const { signIn, signInWithButton, isLoading, error, clearError, isAuthenticated, isAdmin, debugInfo, clearCache } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDebug, setShowDebug] = useState(false);
  const [isAlternativeSignIn, setIsAlternativeSignIn] = useState(false);

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
      
      toast({
        title: "Welcome Back",
        description: "Successfully signed in to admin dashboard.",
      });
    } catch (error) {
      console.error('🔐 Admin login failed:', error);
      
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
            {error && <ErrorHandler error={error} />}

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
