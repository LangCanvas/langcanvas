
import React from 'react';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { AdminDashboardHeader } from '@/components/admin/AdminDashboardHeader';
import { AdminStatsSection } from '@/components/admin/AdminStatsSection';
import { DashboardActions } from '@/components/admin/DashboardActions';

const AdminDashboard = () => {
  const {
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
  } = useAdminDashboard();

  // Show loading state while initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading admin dashboard...</div>
      </div>
    );
  }

  // If not authenticated or not admin, the hook will handle the redirect
  // This is just a safety check - the component shouldn't render in this state
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <AdminDashboardHeader user={user} onSignOut={signOut} />

        <AdminStatsSection stats={stats} />

        <DashboardActions
          stats={stats}
          isLoading={isLoading}
          isMigrating={isMigrating}
          onRefresh={loadAnalytics}
          onMigrate={handleMigrateData}
          onExport={handleExportData}
          onCleanup={handleCleanup}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
