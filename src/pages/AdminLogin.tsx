
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, LogIn, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const AdminLogin = () => {
  const { signIn, isLoading, error, clearError, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const getErrorMessage = (error: string) => {
    if (error.includes('not configured')) {
      return 'Authentication is not properly configured. Please contact the system administrator.';
    }
    if (error.includes('popup blockers')) {
      return 'Please disable popup blockers for this site and try again.';
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
    return error;
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
                  {getErrorMessage(error)}
                </AlertDescription>
              </Alert>
            )}

            <div className="text-center">
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
            </div>

            <div className="text-xs text-muted-foreground text-center space-y-2">
              <p>Only bdevay@gmail.com is authorized to access this dashboard.</p>
              <p className="text-muted-foreground/60">
                Having trouble? Make sure popups are enabled and you have a stable internet connection.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
