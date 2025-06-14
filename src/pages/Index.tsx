
import React, { useRef, useCallback } from 'react';
import Canvas from '../components/Canvas';
import MainApplicationLayout from '../components/layout/MainApplicationLayout';
import { useIndexState } from '../hooks/useIndexState';
import { useIndexPanelHandlers } from '../hooks/useIndexPanelHandlers';
import { useChangeTracking } from '../hooks/useChangeTracking';
import { useWorkflowActions } from '../hooks/useWorkflowActions';
import { useIndexHandlers } from '../hooks/useIndexHandlers';
import { useIndexEventListeners } from '../hooks/useIndexEventListeners';
import { useIndexChangeTrackedHandlers } from '../hooks/useIndexChangeTrackedHandlers';

const Index: React.FC = () => {
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

  // Create a simple function that checks if edge can be created
  const canCreateEdge = useCallback((sourceNode: any) => {
    return true; // Simplified implementation
  }, []);

  // Simple event handlers for canvas
  const handleNodePositionChange = useCallback((id: string, x: number, y: number) => {
    updateNodeProperties(id, { x, y });
  }, [updateNodeProperties]);

  const handleEdgeUpdate = useCallback((id: string, updates: any) => {
    updateEdgeProperties(id, updates);
  }, [updateEdgeProperties]);

  return (
    <MainApplicationLayout
      isMobileMenuOpen={isMobileMenuOpen}
      activePanel={activePanel}
      showValidationPanel={showValidationPanel}
      isLeftPanelVisible={isLeftPanelVisible}
      isLeftPanelExpanded={isLeftPanelExpanded}
      isRightPanelVisible={isRightPanelVisible}
      isRightPanelExpanded={isRightPanelExpanded}
      nodes={nodes}
      edges={edges}
      selectedNode={selectedNode}
      selectedEdge={selectedEdge}
      validationResult={validationResult}
      isSelecting={isSelecting}
      selectedCount={selectedCount}
      onMobileMenuToggle={handleMobileMenuToggle}
      onPanelToggle={handlePanelToggle}
      onToggleLeftPanel={handleToggleLeftPanel}
      onToggleRightPanel={handleToggleRightPanel}
      onExpandLeftPanel={handleExpandLeftPanel}
      onExpandRightPanel={handleExpandRightPanel}
      closePanels={closePanels}
      setShowValidationPanel={setShowValidationPanel}
      switchToPropertiesPanel={switchToPropertiesPanel}
      onNewProject={handleNewProjectChangeTracked}
      onImport={handleImportChangeTracked}
      onExport={handleExportChangeTracked}
      onDeleteNode={handleDeleteNode}
      onDeleteEdge={deleteEdge}
      onUpdateNodeProperties={handleUpdateNodeProperties}
      onUpdateEdgeProperties={handleUpdateEdgeProperties}
      validatePriorityConflicts={validatePriorityConflicts}
    >
      <Canvas
        nodes={nodes}
        edges={edges}
        selectedNodeId={selectedNode?.id || null}
        selectedEdgeId={selectedEdge?.id || null}
        onAddNode={addNode}
        onSelectNode={handleSelectNode}
        onSelectEdge={handleSelectEdge}
        onMoveNode={handleNodePositionChange}
        onDeleteNode={handleDeleteNode}
        onDeleteEdge={deleteEdge}
        onAddEdge={handleAddEdge}
        canCreateEdge={canCreateEdge}
        pendingNodeType={pendingCreation}
        onClearPendingCreation={clearPendingCreation}
      />
    </MainApplicationLayout>
  );
};

export default Index;
