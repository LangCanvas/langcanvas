
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AggregatedStats } from '@/utils/analyticsStorage';
import { AnalyticsCards } from '@/components/admin/AnalyticsCards';

interface AdminStatsSectionProps {
  stats: AggregatedStats | null;
}

export const AdminStatsSection: React.FC<AdminStatsSectionProps> = ({ stats }) => {
  return (
    <>
      <AnalyticsCards stats={stats} />

      {/* Feature Usage and Daily Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Feature Usage</CardTitle>
            <CardDescription>
              Most popular features used by visitors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats?.featureUsage || {})
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .map(([feature, count]) => (
                  <div key={feature} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {feature.replace(/_/g, ' ')}
                    </span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              {Object.keys(stats?.featureUsage || {}).length === 0 && (
                <p className="text-sm text-muted-foreground">No feature usage data yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Active Users</CardTitle>
            <CardDescription>
              User activity over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats?.dailyStats || {})
                .sort(([a], [b]) => b.localeCompare(a))
                .slice(0, 7)
                .map(([date, users]) => (
                  <div key={date} className="flex items-center justify-between text-sm">
                    <span>{new Date(date).toLocaleDateString()}</span>
                    <Badge variant="outline">{users} users</Badge>
                  </div>
                ))}
              {Object.keys(stats?.dailyStats || {}).length === 0 && (
                <p className="text-sm text-muted-foreground">No daily statistics yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
