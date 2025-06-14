import React, { useRef, useCallback } from 'react';
import Canvas from '../components/Canvas';
import MainApplicationLayout from '../components/layout/MainApplicationLayout';
import { useIndexState } from '../hooks/useIndexState';
import { useIndexPanelHandlers } from '../hooks/useIndexPanelHandlers';
import { useIndexSelectionState } from '../hooks/useIndexSelectionState';
import { useIndexHandlers } from '../hooks/useIndexHandlers';
import { useIndexEventListeners } from '../hooks/useIndexEventListeners';
import { useIndexWorkflowHandlers } from '../hooks/useIndexWorkflowHandlers';
import { useIndexMobileHandlers } from '../hooks/useIndexMobileHandlers';
import { useIndexChangeTrackedHandlers } from '../hooks/useIndexChangeTrackedHandlers';

const Index: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  
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
  } = useIndexState();

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
  } = useIndexPanelHandlers(clearPendingCreation);

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

  const {
    isWorkflowValid,
    handleValidateWorkflow,
    handleNewProject,
    handleImport,
    handleExport,
  } = useIndexWorkflowHandlers(nodes, edges, setNodes, setEdges, clearSelection);

  const {
    handleNodePositionChange,
    handleEdgeUpdate,
  } = useIndexEventListeners(setNodes, setEdges, canvasRef);

  const {
    handleSelectionChange,
    handleMultiSelectStart,
    handleMultiSelectEnd,
  } = useIndexSelectionState(canvasRef, nodes, edges, selectNode, selectEdge);

  const {
    handleDeleteNode,
    handleAddEdge,
    handleSelectNode,
    handleSelectEdge,
    handleUpdateNodeProperties,
    handleUpdateEdgeProperties,
  } = useIndexHandlers({
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
    handleCanvasClick,
    handleNodeCreate,
  } = useIndexMobileHandlers(canvasRef, pendingCreation, clearPendingCreation, handleAddEdge);

  const {
    handleNewProjectChangeTracked: handleNewProject,
    handleImportChangeTracked: handleImport,
    handleExportChangeTracked: handleExport,
  } = useIndexChangeTrackedHandlers(handleNewProject, handleImport, handleExport);

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
      onNewProject={handleNewProject}
      onImport={handleImport}
      onExport={handleExport}
      onDeleteNode={handleDeleteNode}
      onDeleteEdge={handleDeleteEdge}
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
