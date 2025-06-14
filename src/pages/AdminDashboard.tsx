
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

  // Early return if not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <AdminDashboardHeader user={user} onSignOut={signOut} />

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading analytics...</div>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
