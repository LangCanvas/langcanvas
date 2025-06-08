
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { AggregatedStats } from '@/utils/analyticsStorage';

interface DashboardActionsProps {
  stats: AggregatedStats | null;
  isLoading: boolean;
  isMigrating: boolean;
  onRefresh: () => void;
  onMigrate: () => void;
  onExport: () => void;
  onCleanup: () => void;
}

export const DashboardActions: React.FC<DashboardActionsProps> = ({
  stats,
  isLoading,
  isMigrating,
  onRefresh,
  onMigrate,
  onExport,
  onCleanup
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="text-sm text-muted-foreground">
        Last updated: {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleString() : 'Never'}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
        <Button 
          variant="outline" 
          onClick={onMigrate} 
          disabled={isMigrating}
        >
          {isMigrating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Migrating...
            </>
          ) : (
            'Migrate Local Data'
          )}
        </Button>
        <Button variant="outline" onClick={onCleanup}>
          Cleanup Old Data
        </Button>
        <Button onClick={onExport}>
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>
    </div>
  );
};
