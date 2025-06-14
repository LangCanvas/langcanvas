
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { unifiedAnalytics } from '@/services/unifiedAnalyticsService';
import { AggregatedStats } from '@/utils/analyticsStorage';

export const useAdminDashboard = () => {
  const { user, isAdmin, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [stats, setStats] = useState<AggregatedStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  // Enhanced authentication check with loop prevention
  useEffect(() => {
    console.log('🏛️ AdminDashboard - Auth check:', { 
      isAuthenticated, 
      isAdmin, 
      userEmail: user?.email,
      currentPath: location.pathname,
      redirectAttempted
    });
    
    // Only check auth after initial loading is complete
    if (isLoading) {
      console.log('🏛️ AdminDashboard - Still loading, skipping auth check');
      return;
    }
    
    // Prevent redirect loops
    if (redirectAttempted) {
      console.log('🏛️ AdminDashboard - Redirect already attempted, skipping');
      return;
    }
    
    // Only redirect if we're actually on the admin dashboard page
    if (location.pathname !== '/admin') {
      console.log('🏛️ AdminDashboard - Not on admin page, skipping redirect');
      return;
    }
    
    if (!isAuthenticated || !isAdmin) {
      console.log('🏛️ AdminDashboard - Access denied, redirecting to admin login');
      setRedirectAttempted(true);
      toast({
        title: "Access Denied",
        description: "Please sign in as an admin to access the dashboard.",
        variant: "destructive",
      });
      navigate('/admin-login', { replace: true });
      return;
    }
    
    console.log('🏛️ AdminDashboard - Access granted, loading analytics');
    loadAnalytics();
  }, [isAuthenticated, isAdmin, isLoading, location.pathname, redirectAttempted, navigate, toast, user]);

  // Set loading to false after a brief delay to ensure auth context is initialized
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

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

  return {
    user,
    isAuthenticated,
    isAdmin,
    signOut,
    stats,
    isLoading,
    isMigrating,
    loadAnalytics,
    handleMigrateData,
    handleExportData,
    handleCleanup
  };
};
