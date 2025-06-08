
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ErrorHandlerProps {
  error: string;
  domainConfig?: { origins: string[], redirects: string[] };
}

export const ErrorHandler: React.FC<ErrorHandlerProps> = ({ error, domainConfig }) => {
  const [copied, setCopied] = useState(false);

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
    if (error.includes('domain authorization') || error.includes('domain_unauthorized') || error.includes('unauthorized_domain') || error.includes('Domain') && error.includes('not authorized')) {
      return 'Domain authorization issue. The current domain is not authorized in Google Cloud Console.';
    }
    if (error.includes('Invalid credential')) {
      return 'Invalid authentication credential received. Please try signing in again.';
    }
    return error;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const getDomainHelp = () => {
    const currentDomain = window.location.hostname;
    const currentOrigin = window.location.origin;
    
    return (
      <div className="text-xs text-muted-foreground space-y-3 mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <div>
          <p><strong>Current origin:</strong> <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded text-xs">{currentOrigin}</code></p>
        </div>
        
        <div className="space-y-2">
          <p className="font-medium text-yellow-800 dark:text-yellow-200">Required configuration in Google Cloud Console:</p>
          
          <div className="space-y-2">
            <div>
              <p className="text-yellow-700 dark:text-yellow-300 font-medium">Authorized JavaScript origins:</p>
              {domainConfig?.origins.map((origin, index) => (
                <div key={index} className="flex items-center gap-2 mt-1">
                  <code className="bg-yellow-100 dark:bg-yellow-800 px-2 py-1 rounded text-xs flex-1">{origin}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(origin)}
                    className="h-6 w-6 p-0"
                  >
                    {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              ))}
            </div>
            
            <div>
              <p className="text-yellow-700 dark:text-yellow-300 font-medium">Authorized redirect URIs:</p>
              {domainConfig?.redirects.map((redirect, index) => (
                <div key={index} className="flex items-center gap-2 mt-1">
                  <code className="bg-yellow-100 dark:bg-yellow-800 px-2 py-1 rounded text-xs flex-1">{redirect}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(redirect)}
                    className="h-6 w-6 p-0"
                  >
                    {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="pt-2 border-t border-yellow-200 dark:border-yellow-700">
          <p className="text-yellow-700 dark:text-yellow-300 mb-2">Steps to fix:</p>
          <ol className="text-yellow-700 dark:text-yellow-300 text-xs space-y-1 list-decimal list-inside">
            <li>Go to Google Cloud Console</li>
            <li>Navigate to APIs & Services → Credentials</li>
            <li>Find OAuth 2.0 client ID: <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">425198427847-rfucr78mvnma3qv94pn9utas046svokk</code></li>
            <li>Add the origins and redirect URIs shown above</li>
            <li>Save changes and wait 5-10 minutes for propagation</li>
          </ol>
        </div>
        
        <a 
          href="https://console.cloud.google.com/apis/credentials" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 underline text-xs"
        >
          Google Cloud Console <ExternalLink className="w-3 h-3 ml-1" />
        </a>
      </div>
    );
  };

  const showDomainHelp = error.includes('not displayed') || 
                         error.includes('domain') || 
                         error.includes('unauthorized') ||
                         error.includes('initialization_failed') ||
                         error.includes('Domain') && error.includes('not authorized');

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
