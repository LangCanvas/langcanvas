
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
    console.log("🟢 handleNewProject called");
    console.log("🟢 nodes length:", nodes.length);
    console.log("🟢 clearWorkflow function:", clearWorkflow);
    console.log("🟢 toast function:", toast);
    
    try {
      if (nodes.length > 0) {
        console.log("🟢 Showing confirmation dialog");
        if (confirm('Are you sure you want to start a new project? All current work will be lost.')) {
          console.log("🟢 User confirmed, calling clearWorkflow");
          clearWorkflow();
          console.log("🟢 clearWorkflow completed, showing toast");
          toast({
            title: "New Project",
            description: "Started a new project successfully.",
          });
          console.log("🟢 Toast displayed");
        } else {
          console.log("🟢 User cancelled");
        }
      } else {
        console.log("🟢 No nodes, showing already new toast");
        toast({
          title: "New Project",
          description: "Already working on a new project.",
        });
        console.log("🟢 Toast displayed");
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
    console.log("🟡 handleImport called");
    
    try {
      console.log("🟡 Creating file input element");
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      console.log("🟡 Setting up file input onchange");
      input.onchange = (e) => {
        console.log("🟡 File input changed, event:", e);
        const file = (e.target as HTMLInputElement).files?.[0];
        console.log("🟡 Selected file:", file);
        
        if (file) {
          console.log("🟡 Creating FileReader");
          const reader = new FileReader();
          reader.onload = (event) => {
            console.log("🟡 FileReader onload triggered");
            try {
              const jsonString = event.target?.result as string;
              console.log("🟡 File content:", jsonString);
              
              const validation = validateWorkflow(jsonString);
              console.log("🟡 Validation result:", validation);
              
              if (!validation.valid) {
                console.log("🟡 Validation failed");
                toast({
                  title: "Import Failed",
                  description: `Invalid file format: ${validation.errors.join(', ')}`,
                  variant: "destructive",
                });
                return;
              }

              console.log("🟡 Calling importWorkflow");
              const result = importWorkflow(jsonString);
              console.log("🟡 Import result:", result);
              
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
              console.error("🟡 Error reading file:", error);
              toast({
                title: "Import Failed",
                description: "Failed to read or parse the file.",
                variant: "destructive",
              });
            }
          };
          
          console.log("🟡 Starting to read file as text");
          reader.readAsText(file);
        } else {
          console.log("🟡 No file selected");
        }
      };
      
      console.log("🟡 Triggering file input click");
      input.click();
      console.log("🟡 File input click triggered");
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
    console.log("🔵 handleExport called");
    console.log("🔵 exportWorkflowAsString function:", exportWorkflowAsString);
    
    try {
      console.log("🔵 Starting export process");
      const workflowJson = exportWorkflowAsString();
      console.log("🔵 Generated workflow JSON:", workflowJson);
      
      console.log("🔵 Creating blob");
      const blob = new Blob([workflowJson], { type: 'application/json' });
      console.log("🔵 Created blob:", blob);
      
      console.log("🔵 Creating object URL");
      const url = URL.createObjectURL(blob);
      console.log("🔵 Created object URL:", url);
      
      console.log("🔵 Creating download link");
      const link = document.createElement('a');
      link.href = url;
      link.download = 'workflow.json';
      link.style.display = 'none';
      
      console.log("🔵 Adding link to document body");
      document.body.appendChild(link);
      
      console.log("🔵 Clicking download link");
      link.click();
      
      console.log("🔵 Cleaning up");
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log("🔵 Cleanup completed");
      }, 100);
      
      console.log("🔵 Showing success toast");
      toast({
        title: "Export Successful",
        description: "Workflow exported as workflow.json",
      });
      console.log("🔵 Export completed successfully");
    } catch (error) {
      console.error("🔵 Export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export workflow.",
        variant: "destructive",
      });
    }
  };

  const handleCodePreview = () => {
    console.log("🟣 handleCodePreview called");
    console.log("🟣 Code preview - not implemented yet");
  };

  console.log("🔧 useWorkflowActions returning handlers:");
  console.log("🔧 handleNewProject:", handleNewProject);
  console.log("🔧 handleImport:", handleImport);
  console.log("🔧 handleExport:", handleExport);
  console.log("🔧 handleCodePreview:", handleCodePreview);

  return {
    handleNewProject,
    handleImport,
    handleExport,
    handleCodePreview
  };
};
