
import { useEnhancedAnalytics } from './useEnhancedAnalytics';

interface UseIndexWorkflowHandlersProps {
  handleNewProject: () => void;
  handleImport: () => void;
  handleExport: () => void;
}

export const useIndexWorkflowHandlers = ({
  handleNewProject,
  handleImport,
  handleExport,
}: UseIndexWorkflowHandlersProps) => {
  const analytics = useEnhancedAnalytics();

  const handleNewProjectWithAnalytics = () => {
    handleNewProject();
    analytics.trackFeatureUsage('new_project_created');
  };

  const handleImportWithAnalytics = () => {
    handleImport();
    // Note: actual import tracking happens in useWorkflowActions when import succeeds
  };

  const handleExportWithAnalytics = () => {
    handleExport();
    // Note: actual export tracking happens in useWorkflowActions when export succeeds
  };

  return {
    handleNewProjectWithAnalytics,
    handleImportWithAnalytics,
    handleExportWithAnalytics,
  };
};
