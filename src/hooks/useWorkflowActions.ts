
import { useToast } from '@/hooks/use-toast';
import { useEnhancedAnalytics } from '@/hooks/useEnhancedAnalytics';
import { ValidationResult } from '../utils/graphValidation';

interface UseWorkflowActionsProps {
  nodes: any[];
  exportWorkflowAsString: () => string;
  importWorkflow: (jsonString: string) => { success: boolean; errors: string[] };
  validateWorkflow: (jsonString: string) => { valid: boolean; errors: string[] };
  clearWorkflow: () => void;
  validationResult?: ValidationResult;
}

export const useWorkflowActions = ({
  nodes,
  exportWorkflowAsString,
  importWorkflow,
  validateWorkflow,
  clearWorkflow,
  validationResult
}: UseWorkflowActionsProps) => {
  const { toast } = useToast();
  const { trackFeatureUsage, trackWorkflowExported, trackWorkflowImported } = useEnhancedAnalytics();

  const handleNewProject = () => {
    console.log("🟢 REAL handleNewProject called - UPDATED VERSION");
    
    try {
      if (nodes.length > 0) {
        if (confirm('Are you sure you want to start a new project? All current work will be lost.')) {
          clearWorkflow();
          trackFeatureUsage('new_project');
          toast({
            title: "New Project",
            description: "Started a new project successfully.",
          });
        }
      } else {
        trackFeatureUsage('new_project_empty');
        toast({
          title: "New Project",
          description: "Already working on a new project.",
        });
      }
    } catch (error) {
      console.error("🟢 Error in handleNewProject:", error);
      toast({
        title: "Error",
        description: "Failed to create new project.",
        variant: "destructive",
      });
    }
  };

  const handleImport = () => {
    console.log("🟡 REAL handleImport called - UPDATED VERSION");
    
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const jsonString = event.target?.result as string;
              
              const validation = validateWorkflow(jsonString);
              
              if (!validation.valid) {
                trackFeatureUsage('import_failed', { reason: 'validation_error' });
                toast({
                  title: "Import Failed",
                  description: `Invalid file format: ${validation.errors.join(', ')}`,
                  variant: "destructive",
                });
                return;
              }

              const result = importWorkflow(jsonString);
              
              if (result.success) {
                // Count imported nodes and edges for analytics
                const importedData = JSON.parse(jsonString);
                const nodeCount = importedData.nodes?.length || 0;
                const edgeCount = importedData.edges?.length || 0;
                
                trackWorkflowImported(nodeCount, edgeCount);
                trackFeatureUsage('import_success', { nodeCount, edgeCount });
                
                toast({
                  title: "Import Successful",
                  description: result.errors.length > 0 
                    ? `Imported with warnings: ${result.errors.join(', ')}`
                    : "Workflow imported successfully.",
                });
              } else {
                trackFeatureUsage('import_failed', { reason: 'processing_error' });
                toast({
                  title: "Import Failed",
                  description: result.errors.join(', '),
                  variant: "destructive",
                });
              }
            } catch (error) {
              console.error("🟡 Error reading file:", error);
              trackFeatureUsage('import_failed', { reason: 'file_read_error' });
              toast({
                title: "Import Failed",
                description: "Failed to read or parse the file.",
                variant: "destructive",
              });
            }
          };
          
          reader.readAsText(file);
        }
      };
      
      input.click();
      trackFeatureUsage('import_initiated');
    } catch (error) {
      console.error("🟡 Error in handleImport:", error);
      toast({
        title: "Import Failed",
        description: "Failed to open file dialog.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    console.log("🔵 REAL handleExport called - UPDATED VERSION");
    console.log("🔵 Current validation result:", validationResult);
    
    try {
      // Check for validation errors before export
      if (validationResult && validationResult.errorCount > 0) {
        const errorMessages = validationResult.issues
          .filter(issue => issue.severity === 'error')
          .map(issue => `• ${issue.message}`)
          .join('\n');
          
        const proceed = confirm(
          `The workflow has ${validationResult.errorCount} error(s):\n\n${errorMessages}\n\nIt's recommended to fix these errors before exporting. Continue with export anyway?`
        );
        
        if (!proceed) {
          trackFeatureUsage('export_cancelled', { reason: 'validation_errors' });
          toast({
            title: "Export Cancelled",
            description: "Please fix the errors and try again.",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Show warnings if any
      if (validationResult && validationResult.warningCount > 0) {
        const warningMessages = validationResult.issues
          .filter(issue => issue.severity === 'warning')
          .map(issue => issue.message)
          .join(', ');
          
        toast({
          title: "Export with Warnings",
          description: `Note: ${warningMessages}`,
        });
      }
      
      const workflowJson = exportWorkflowAsString();
      
      const blob = new Blob([workflowJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'langcanvas-workflow.json';
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      // Track export with node/edge counts
      const edgeCount = (JSON.parse(workflowJson).edges || []).length;
      trackWorkflowExported(nodes.length, edgeCount);
      trackFeatureUsage('export_success', { 
        nodeCount: nodes.length, 
        edgeCount,
        hasValidationErrors: (validationResult?.errorCount || 0) > 0 
      });
      
      toast({
        title: "Export Successful",
        description: "Workflow exported as langcanvas-workflow.json",
      });
    } catch (error) {
      console.error("🔵 Export error:", error);
      trackFeatureUsage('export_failed');
      toast({
        title: "Export Failed",
        description: "Failed to export workflow.",
        variant: "destructive",
      });
    }
  };

  return {
    handleNewProject,
    handleImport,
    handleExport
  };
};
