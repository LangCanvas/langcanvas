
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ExternalLink } from 'lucide-react';

interface ErrorHandlerProps {
  error: string;
}

export const ErrorHandler: React.FC<ErrorHandlerProps> = ({ error }) => {
  const getErrorMessage = (error: string) => {
    if (error.includes('not configured') || error.includes('initialization_failed')) {
      return 'Authentication system could not be initialized. This may be due to network issues or browser restrictions.';
    }
    if (error.includes('popup blockers') || error.includes('not displayed') || error.includes('popup_blocked')) {
      return 'Sign-in popup was blocked. Please disable popup blockers for this site and try the alternative sign-in method below.';
    }
    if (error.includes('Access denied')) {
      return error;
    }
    if (error.includes('cancelled') || error.includes('dismissed') || error.includes('user_cancelled')) {
      return 'Sign-in was cancelled. Please try again to access the admin dashboard.';
    }
    if (error.includes('timeout') || error.includes('network_error')) {
      return 'Sign-in timed out or network error occurred. Please check your internet connection and try again.';
    }
    if (error.includes('domain authorization') || error.includes('domain_unauthorized') || error.includes('unauthorized_domain')) {
      return 'Domain authorization issue. The current domain may not be authorized in Google Cloud Console.';
    }
    if (error.includes('Invalid credential')) {
      return 'Invalid authentication credential received. Please try signing in again.';
    }
    return error;
  };

  const getDomainHelp = () => {
    const currentDomain = window.location.hostname;
    return (
      <div className="text-xs text-muted-foreground space-y-2 mt-3">
        <p><strong>Current domain:</strong> {currentDomain}</p>
        <p>If you're the administrator, ensure this domain is added to "Authorized JavaScript origins" in Google Cloud Console for the OAuth 2.0 client.</p>
        <a 
          href="https://console.cloud.google.com/apis/credentials" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 underline"
        >
          Google Cloud Console <ExternalLink className="w-3 h-3 ml-1" />
        </a>
      </div>
    );
  };

  const showDomainHelp = error.includes('not displayed') || 
                         error.includes('domain') || 
                         error.includes('unauthorized') ||
                         error.includes('initialization_failed');

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-2">
          <p>{getErrorMessage(error)}</p>
          {showDomainHelp && getDomainHelp()}
        </div>
      </AlertDescription>
    </Alert>
  );
};
