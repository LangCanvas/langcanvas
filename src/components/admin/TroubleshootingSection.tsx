
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bug, RefreshCw, Settings } from 'lucide-react';

interface TroubleshootingSectionProps {
  debugInfo: string[];
  onClearCache: () => void;
  showDebug: boolean;
  onToggleDebug: (show: boolean) => void;
}

export const TroubleshootingSection: React.FC<TroubleshootingSectionProps> = ({
  debugInfo,
  onClearCache,
  showDebug,
  onToggleDebug
}) => {
  return (
    <div className="border-t pt-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Troubleshooting</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleDebug(!showDebug)}
        >
          <Bug className="w-4 h-4 mr-1" />
          {showDebug ? 'Hide' : 'Show'} Debug
        </Button>
      </div>

      <div className="space-y-2">
        <Button
          onClick={onClearCache}
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
  );
};
