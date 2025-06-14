
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
    setLastLeftExpandedWidth,
    setLastRightExpandedWidth,
  } = panelHandlers;

  // Listen for last expanded width events
  React.useEffect(() => {
    const handleSetLastLeftExpandedWidth = (event: CustomEvent) => {
      setLastLeftExpandedWidth(event.detail);
    };

    const handleSetLastRightExpandedWidth = (event: CustomEvent) => {
      setLastRightExpandedWidth(event.detail);
    };

    window.addEventListener('setLastLeftExpandedWidth', handleSetLastLeftExpandedWidth as EventListener);
    window.addEventListener('setLastRightExpandedWidth', handleSetLastRightExpandedWidth as EventListener);

    return () => {
      window.removeEventListener('setLastLeftExpandedWidth', handleSetLastLeftExpandedWidth as EventListener);
      window.removeEventListener('setLastRightExpandedWidth', handleSetLastRightExpandedWidth as EventListener);
    };
  }, [setLastLeftExpandedWidth, setLastRightExpandedWidth]);

  const changeTracking = useChangeTracking();
  const workflowActions = useWorkflowActions();

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

  // Simple event handlers for canvas
  const handleNodePositionChange = useCallback((id: string, x: number, y: number) => {
    updateNodeProperties(id, { x, y });
  }, [updateNodeProperties]);

  const handleEdgeUpdate = useCallback((id: string, updates: any) => {
    updateEdgeProperties(id, updates);
  }, [updateEdgeProperties]);

  // Simple selection handlers
  const handleSelectionChange = useCallback((state: any) => {
    // Handle selection state change
  }, []);

  const handleMultiSelectStart = useCallback(() => {
    // Handle multi-select start
  }, []);

  const handleMultiSelectEnd = useCallback(() => {
    // Handle multi-select end
  }, []);

  // Simple mobile handlers
  const handleCanvasClick = useCallback(() => {
    clearPendingCreation();
  }, [clearPendingCreation]);

  const handleNodeCreate = useCallback((type: any, x: number, y: number) => {
    addNode(type, x, y);
  }, [addNode]);

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
        ref={canvasRef}
        nodes={nodes}
        edges={edges}
        selectedNode={selectedNode}
        selectedEdge={selectedEdge}
        pendingCreation={pendingCreation}
        dragMode={dragMode}
        isSelecting={isSelecting}
        selectedCount={selectedCount}
        validationResult={validationResult}
        onNodePositionChange={handleNodePositionChange}
        onNodeSelect={handleSelectNode}
        onEdgeSelect={handleSelectEdge}
        onCanvasClick={handleCanvasClick}
        onNodeCreate={handleNodeCreate}
        onEdgeCreate={handleAddEdge}
        onEdgeUpdate={handleEdgeUpdate}
        onClearSelection={clearSelection}
        onSelectionChange={handleSelectionChange}
        onMultiSelectStart={handleMultiSelectStart}
        onMultiSelectEnd={handleMultiSelectEnd}
      />
    </MainApplicationLayout>
  );
};

export default Index;
