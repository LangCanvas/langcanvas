
import { useToast } from '@/hooks/use-toast';

interface UseWorkflowActionsProps {
  nodes: any[];
  exportWorkflowAsString: () => string;
  importWorkflow: (jsonString: string) => { success: boolean; errors: string[] };
  validateWorkflow: (jsonString: string) => { valid: boolean; errors: string[] };
  clearWorkflow: () => void;
}

export const useWorkflowActions = ({
  nodes,
  exportWorkflowAsString,
  importWorkflow,
  validateWorkflow,
  clearWorkflow
}: UseWorkflowActionsProps) => {
  const { toast } = useToast();

  const handleNewProject = () => {
    if (nodes.length > 0) {
      if (confirm('Are you sure you want to start a new project? All current work will be lost.')) {
        clearWorkflow();
        toast({
          title: "New Project",
          description: "Started a new project successfully.",
        });
      }
    } else {
      toast({
        title: "New Project",
        description: "Already working on a new project.",
      });
    }
  };

  const handleImport = () => {
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
              toast({
                title: "Import Failed",
                description: `Invalid file format: ${validation.errors.join(', ')}`,
                variant: "destructive",
              });
              return;
            }

            const result = importWorkflow(jsonString);
            if (result.success) {
              toast({
                title: "Import Successful",
                description: result.errors.length > 0 
                  ? `Imported with warnings: ${result.errors.join(', ')}`
                  : "Workflow imported successfully.",
                variant: result.errors.length > 0 ? "default" : "default",
              });
            } else {
              toast({
                title: "Import Failed",
                description: result.errors.join(', '),
                variant: "destructive",
              });
            }
          } catch (error) {
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
  };

  const handleExport = () => {
    try {
      const workflowJson = exportWorkflowAsString();
      const blob = new Blob([workflowJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'workflow.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Workflow exported as workflow.json",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export workflow.",
        variant: "destructive",
      });
    }
  };

  const handleCodePreview = () => {
    console.log("Code preview - not implemented yet");
  };

  return {
    handleNewProject,
    handleImport,
    handleExport,
    handleCodePreview
  };
};
