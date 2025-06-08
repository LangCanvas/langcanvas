
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ErrorHandlerProps {
  error: string;
}

export const ErrorHandler: React.FC<ErrorHandlerProps> = ({ error }) => {
  const getErrorMessage = (error: string) => {
    if (error.includes('not configured')) {
      return 'Authentication is not properly configured. Please contact the system administrator.';
    }
    if (error.includes('popup blockers') || error.includes('not displayed')) {
      return 'Sign-in popup was blocked or couldn\'t be displayed. Please disable popup blockers and try the alternative sign-in method below.';
    }
    if (error.includes('Access denied')) {
      return error;
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
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-2">
          <p>{getErrorMessage(error)}</p>
          {(error.includes('not displayed') || error.includes('domain')) && getDomainHelp()}
        </div>
      </AlertDescription>
    </Alert>
  );
};
