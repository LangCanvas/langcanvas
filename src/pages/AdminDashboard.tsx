
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { unifiedAnalytics } from '@/services/unifiedAnalyticsService';
import { AggregatedStats } from '@/utils/analyticsStorage';
import { useToast } from '@/hooks/use-toast';
import { AnalyticsCards } from '@/components/admin/AnalyticsCards';
import { DashboardActions } from '@/components/admin/DashboardActions';

const AdminDashboard = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<AggregatedStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    
    loadAnalytics();
  }, [isAdmin, navigate]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const analyticsStats = await unifiedAnalytics.getAggregatedStats();
      setStats(analyticsStats);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMigrateData = async () => {
    try {
      setIsMigrating(true);
      await unifiedAnalytics.migrateLocalToRemote();
      
      toast({
        title: "Migration Successful",
        description: "Local analytics data migrated to Firestore successfully.",
      });
      
      await loadAnalytics();
    } catch (error) {
      console.error('Migration failed:', error);
      toast({
        title: "Migration Failed",
        description: "Failed to migrate analytics data.",
        variant: "destructive",
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleExportData = async () => {
    try {
      const exportData = {
        stats,
        exportDate: new Date().toISOString(),
        source: 'unified_analytics_service'
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `langcanvas-analytics-${new Date().toISOString().split('T')[0]}.json`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      toast({
        title: "Export Successful",
        description: "Analytics data exported successfully.",
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export analytics data.",
        variant: "destructive",
      });
    }
  };

  const handleCleanup = async () => {
    try {
      await unifiedAnalytics.cleanup();
      toast({
        title: "Cleanup Successful",
        description: "Old analytics data cleaned up successfully.",
      });
      await loadAnalytics();
    } catch (error) {
      console.error('Cleanup failed:', error);
      toast({
        title: "Cleanup Failed",
        description: "Failed to cleanup analytics data.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = () => {
    signOut();
    navigate('/');
    toast({
      title: "Signed Out",
      description: "You have been signed out successfully.",
    });
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="mb-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to LangCanvas
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Unified analytics and user insights</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img 
                src={user?.picture} 
                alt={user?.name} 
                className="w-8 h-8 rounded-full"
              />
              <div className="text-sm">
                <div className="font-medium">{user?.name}</div>
                <div className="text-muted-foreground">{user?.email}</div>
              </div>
              <Badge variant="secondary">Admin</Badge>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading analytics...</div>
          </div>
        ) : (
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

            <DashboardActions
              stats={stats}
              isLoading={isLoading}
              isMigrating={isMigrating}
              onRefresh={loadAnalytics}
              onMigrate={handleMigrateData}
              onExport={handleExportData}
              onCleanup={handleCleanup}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
