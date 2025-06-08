
import React from 'react';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

interface AdminLoginDiagnosticsProps {
  showDiagnostics: boolean;
  onToggleDiagnostics: () => void;
  diagnosticInfo: Record<string, any>;
  hasAuthError: boolean;
}

export const AdminLoginDiagnostics: React.FC<AdminLoginDiagnosticsProps> = ({
  showDiagnostics,
  onToggleDiagnostics,
  diagnosticInfo,
  hasAuthError
}) => {
  if (!hasAuthError) return null;

  return (
    <>
      <div className="flex items-center justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleDiagnostics}
        >
          <Info className="w-4 h-4 mr-1" />
          {showDiagnostics ? 'Hide' : 'Show'} Diagnostics
        </Button>
      </div>

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
    </>
  );
};
