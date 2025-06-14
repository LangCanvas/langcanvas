
import { useEnhancedNodes } from './useEnhancedNodes';
import { useEnhancedEdges } from './useEnhancedEdges';
import { useNodeCreation } from './useNodeCreation';
import { useWorkflowSerializer } from './useWorkflowSerializer';
import { useValidation } from './useValidation';

export const useIndexState = () => {
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
  } = useEnhancedNodes();

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
  } = useEnhancedEdges();
  
  const {
    pendingCreation,
    clearPendingCreation,
    dragMode,
    isSelecting,
    selectedCount,
  } = useNodeCreation({ 
    onAddNode: addNode 
  });

  const {
    handleNewProjectWithAnalytics: handleNewProject,
    handleImportWithAnalytics: handleImport,
    handleExportWithAnalytics: handleExport,
  } = useWorkflowSerializer({
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
    validationResult,
    validatePriorityConflicts,
    isWorkflowValid,
    handleValidateWorkflow,
  } = useValidation({ 
    nodes, 
    edges 
  });

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
    pendingCreation,
    clearPendingCreation,
    dragMode,
    isSelecting,
    selectedCount,
    
    // Workflow operations
    handleNewProject,
    handleImport,
    handleExport,
    isWorkflowValid,
    handleValidateWorkflow,
    
    // Validation
    validationResult,
    validatePriorityConflicts,
  };
};
