
import { useEnhancedNodes } from './useEnhancedNodes';
import { useEnhancedEdges } from './useEnhancedEdges';
import { useNodeCreation } from './useNodeCreation';
import { useWorkflowSerializer } from './useWorkflowSerializer';
import { useValidation } from './useValidation';
import { useIndexWorkflowHandlers } from './useIndexWorkflowHandlers';

export const useIndexState = () => {
  const enhancedNodes = useEnhancedNodes();
  const {
    nodes,
    selectedNode,
    selectedNodeId,
    addNode,
    updateNodePosition,
    updateNodeProperties,
    deleteNode,
    setNodes,
    selectNode,
    clearSelection,
  } = enhancedNodes;

  const enhancedEdges = useEnhancedEdges();
  const {
    edges,
    selectedEdge,
    selectedEdgeId,
    addEdge,
    updateEdgeProperties,
    deleteEdge,
    deleteEdgesForNode,
    setEdges,
    selectEdge,
    validatePriorityConflicts,
  } = enhancedEdges;
  
  const nodeCreation = useNodeCreation({ 
    onAddNode: addNode 
  });
  
  const {
    pendingNodeType,
    clearPendingCreation,
  } = nodeCreation;

  const workflowSerializer = useWorkflowSerializer({
    nodes,
    edges,
    addNode,
    addEdge,
    updateNodeProperties,
    updateEdgeProperties,
    deleteNode,
    deleteEdge,
    selectNode,
    selectEdge
  });

  const {
    exportWorkflow,
    exportWorkflowAsString,
    importWorkflow,
    validateWorkflow,
    clearWorkflow,
  } = workflowSerializer;

  const indexWorkflowHandlers = useIndexWorkflowHandlers({
    handleNewProject: clearWorkflow,
    handleImport: () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const jsonString = event.target?.result as string;
            importWorkflow(jsonString);
          };
          reader.readAsText(file);
        }
      };
      input.click();
    },
    handleExport: () => {
      const workflowJson = exportWorkflowAsString();
      const blob = new Blob([workflowJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'langcanvas-workflow.json';
      link.click();
      URL.revokeObjectURL(url);
    },
  });

  const {
    handleNewProjectWithAnalytics,
    handleImportWithAnalytics,
    handleExportWithAnalytics,
  } = indexWorkflowHandlers;

  const validation = useValidation({ 
    nodes, 
    edges 
  });

  const {
    validationResult,
    runValidation,
  } = validation;

  // Derive isWorkflowValid from validationResult
  const isWorkflowValid = validationResult.isValid;
  const handleValidateWorkflow = runValidation;

  return {
    // Node state
    nodes,
    selectedNode,
    selectedNodeId,
    addNode,
    updateNodePosition,
    updateNodeProperties,
    deleteNode,
    setNodes,
    selectNode,
    clearSelection,
    
    // Edge state
    edges,
    selectedEdge,
    selectedEdgeId,
    addEdge,
    updateEdgeProperties,
    deleteEdge,
    deleteEdgesForNode,
    setEdges,
    selectEdge,
    
    // Node creation state
    pendingCreation: pendingNodeType,
    clearPendingCreation,
    dragMode: null, // placeholder
    isSelecting: false, // placeholder
    selectedCount: 0, // placeholder
    
    // Workflow operations
    handleNewProject: handleNewProjectWithAnalytics,
    handleImport: handleImportWithAnalytics,
    handleExport: handleExportWithAnalytics,
    isWorkflowValid,
    handleValidateWorkflow,
    
    // Validation
    validationResult,
    validatePriorityConflicts,
    
    // Expose grouped objects for other hooks that need them
    nodeState: enhancedNodes,
    edgeState: enhancedEdges,
    nodeCreation,
    workflowActions: workflowSerializer,
    validation,
  };
};
