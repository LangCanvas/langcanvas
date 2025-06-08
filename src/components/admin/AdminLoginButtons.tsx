
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, Loader2, RefreshCw } from 'lucide-react';

interface AdminLoginButtonsProps {
  onSignIn: () => Promise<void>;
  onAlternativeSignIn: () => Promise<void>;
  isLoading: boolean;
  isAlternativeSignIn: boolean;
  isDomainIssue: boolean;
  hasError: boolean;
}

export const AdminLoginButtons: React.FC<AdminLoginButtonsProps> = ({
  onSignIn,
  onAlternativeSignIn,
  isLoading,
  isAlternativeSignIn,
  isDomainIssue,
  hasError
}) => {
  return (
    <div className="text-center space-y-3">
      <p className="text-sm text-muted-foreground mb-4">
        This dashboard is restricted to authorized administrators only.
      </p>
      
      <Button 
        onClick={onSignIn}
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

      {hasError && !isDomainIssue && (
        <Button 
          onClick={onAlternativeSignIn}
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
  );
};
