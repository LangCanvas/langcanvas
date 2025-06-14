
import { useEnhancedNodes } from './useEnhancedNodes';
import { useEnhancedEdges } from './useEnhancedEdges';
import { useNodeCreation } from './useNodeCreation';
import { useWorkflowSerializer } from './useWorkflowSerializer';
import { useValidation } from './useValidation';

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
    handleNewProjectWithAnalytics: handleNewProject,
    handleImportWithAnalytics: handleImport,
    handleExportWithAnalytics: handleExport,
  } = workflowSerializer;

  const validation = useValidation({ 
    nodes, 
    edges 
  });

  const {
    validationResult,
    isWorkflowValid,
    handleValidateWorkflow,
  } = validation;

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
    handleNewProject,
    handleImport,
    handleExport,
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
