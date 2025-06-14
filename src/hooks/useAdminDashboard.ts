
import { useState, useEffect, useRef } from 'react';
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
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const analyticsLoadedRef = useRef(false);

  // Separate auth initialization from analytics loading
  useEffect(() => {
    console.log('🏛️ AdminDashboard - Auth initialization:', { 
      isAuthenticated, 
      isAdmin, 
      userEmail: user?.email,
      currentPath: location.pathname
    });
    
    // Set auth loading to false after a brief moment to allow auth context to settle
    const timer = setTimeout(() => {
      setIsAuthLoading(false);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle authentication and authorization separately from analytics
  useEffect(() => {
    // Skip if still doing initial auth loading
    if (isAuthLoading) {
      console.log('🏛️ AdminDashboard - Still in auth loading phase');
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
    
    console.log('🏛️ AdminDashboard - Access granted, user is authenticated admin');
    
    // Load analytics only once when properly authenticated
    if (!analyticsLoadedRef.current && !isAnalyticsLoading) {
      console.log('🏛️ AdminDashboard - Loading analytics for the first time');
      analyticsLoadedRef.current = true;
      loadAnalytics();
    }
  }, [isAuthenticated, isAdmin, isAuthLoading, location.pathname, redirectAttempted, navigate, toast, user]);

  const loadAnalytics = async () => {
    // Prevent multiple simultaneous calls
    if (isAnalyticsLoading) {
      console.log('🏛️ AdminDashboard - Analytics already loading, skipping');
      return;
    }

    try {
      console.log('🏛️ AdminDashboard - Starting analytics load');
      setIsAnalyticsLoading(true);
      const analyticsStats = await unifiedAnalytics.getAggregatedStats();
      setStats(analyticsStats);
      console.log('🏛️ AdminDashboard - Analytics loaded successfully');
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyticsLoading(false);
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

  // Return combined loading state for the component
  const isLoading = isAuthLoading || isAnalyticsLoading;

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
