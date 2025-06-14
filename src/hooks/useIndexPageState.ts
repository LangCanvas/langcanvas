
import { useRef } from 'react';
import { useIndexState } from './useIndexState';
import { useIndexPanelHandlers } from './useIndexPanelHandlers';
import { useChangeTracking } from './useChangeTracking';
import { useWorkflowActions } from './useWorkflowActions';
import { useIndexHandlers } from './useIndexHandlers';
import { useIndexEventListeners } from './useIndexEventListeners';
import { useIndexChangeTrackedHandlers } from './useIndexChangeTrackedHandlers';

export const useIndexPageState = () => {
  console.log('📄 Index.tsx - Component render started');
  
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const indexState = useIndexState();
  const {
    nodes,
    edges,
    pendingCreation,
    clearPendingCreation,
    dragMode,
    isSelecting,
    selectedCount,
    validationResult,
    deleteNode,
    deleteEdge,
    addEdge,
    deleteEdgesForNode,
    updateNodeProperties,
    updateEdgeProperties,
    setNodes,
    setEdges,
    selectNode,
    selectEdge,
    clearSelection,
    validatePriorityConflicts,
    selectedNode,
    selectedEdge,
    handleNewProject,
    handleImport,
    handleExport,
    isWorkflowValid,
    handleValidateWorkflow,
    addNode,
  } = indexState;

  console.log('📄 Index.tsx - IndexState loaded:', {
    nodesCount: nodes.length,
    edgesCount: edges.length,
    selectedNode: selectedNode?.id || 'none',
    selectedEdge: selectedEdge?.id || 'none',
    validationIssues: validationResult.issues.length
  });

  const panelHandlers = useIndexPanelHandlers(clearPendingCreation);
  const {
    isMobileMenuOpen,
    activePanel,
    showValidationPanel,
    isLeftPanelVisible,
    isLeftPanelExpanded,
    isRightPanelVisible,
    isRightPanelExpanded,
    setShowValidationPanel,
    handleMobileMenuToggle,
    handlePanelToggle,
    handleToggleLeftPanel,
    handleToggleRightPanel,
    handleExpandLeftPanel,
    handleExpandRightPanel,
    closePanels,
    switchToPropertiesPanel,
  } = panelHandlers;

  console.log('📄 Index.tsx - Panel handlers loaded:', {
    isLeftPanelVisible,
    isRightPanelVisible,
    isLeftPanelExpanded,
    isRightPanelExpanded,
    isMobileMenuOpen,
    activePanel
  });

  const changeTracking = useChangeTracking();
  const workflowActions = useWorkflowActions({
    nodes,
    exportWorkflowAsString: indexState.workflowActions.exportWorkflowAsString,
    importWorkflow: indexState.workflowActions.importWorkflow,
    validateWorkflow: indexState.workflowActions.validateWorkflow,
    clearWorkflow: indexState.workflowActions.clearWorkflow,
    validationResult
  });

  const indexHandlers = useIndexHandlers({
    nodes,
    deleteEdgesForNode,
    deleteNode,
    deleteEdge,
    addEdge,
    selectNode,
    selectEdge,
    updateNodeProperties,
    updateEdgeProperties,
  });

  const {
    handleDeleteNode,
    handleAddEdge,
    handleSelectNode,
    handleSelectEdge,
    handleUpdateNodeProperties,
    handleUpdateEdgeProperties,
  } = indexHandlers;

  const changeTrackedHandlers = useIndexChangeTrackedHandlers({
    nodeCreation: indexState.nodeCreation,
    nodeState: indexState.nodeState,
    edgeState: indexState.edgeState,
    indexHandlers,
    workflowActions,
    changeTracking,
  });

  const {
    handleNewProjectWithTracking: handleNewProjectChangeTracked,
    handleImportWithTracking: handleImportChangeTracked,
    handleExportWithTracking: handleExportChangeTracked,
  } = changeTrackedHandlers;

  useIndexEventListeners({
    nodeCreation: indexState.nodeCreation,
    indexHandlers,
    panelHandlers,
  });

  return {
    canvasRef,
    // State
    nodes,
    edges,
    pendingCreation,
    selectedNode,
    selectedEdge,
    validationResult,
    isSelecting,
    selectedCount,
    // Panel state
    isMobileMenuOpen,
    activePanel,
    showValidationPanel,
    isLeftPanelVisible,
    isLeftPanelExpanded,
    isRightPanelVisible,
    isRightPanelExpanded,
    // Handlers
    handleMobileMenuToggle,
    handlePanelToggle,
    handleToggleLeftPanel,
    handleToggleRightPanel,
    handleExpandLeftPanel,
    handleExpandRightPanel,
    closePanels,
    setShowValidationPanel,
    switchToPropertiesPanel,
    handleNewProjectChangeTracked,
    handleImportChangeTracked,
    handleExportChangeTracked,
    handleDeleteNode,
    handleSelectNode,
    handleSelectEdge,
    handleUpdateNodeProperties,
    handleUpdateEdgeProperties,
    handleAddEdge,
    addNode,
    clearPendingCreation,
    deleteEdge,
    validatePriorityConflicts,
  };
};
