
import React from 'react';
import Canvas from '../components/Canvas';
import MainApplicationLayout from '../components/layout/MainApplicationLayout';
import { useIndexPageState } from '../hooks/useIndexPageState';
import { useIndexCanvasHandlers } from '../hooks/useIndexCanvasHandlers';

const Index: React.FC = () => {
  const {
    canvasRef,
    nodes,
    edges,
    pendingCreation,
    selectedNode,
    selectedEdge,
    validationResult,
    isSelecting,
    selectedCount,
    isMobileMenuOpen,
    activePanel,
    showValidationPanel,
    isLeftPanelVisible,
    isLeftPanelExpanded,
    isRightPanelVisible,
    isRightPanelExpanded,
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
  } = useIndexPageState();

  const { canCreateEdge, handleNodePositionChange } = useIndexCanvasHandlers({
    updateNodeProperties: handleUpdateNodeProperties,
    updateEdgeProperties: handleUpdateEdgeProperties,
  });

  console.log('📄 Index.tsx - About to render MainApplicationLayout with props:', {
    isLeftPanelVisible,
    isRightPanelVisible,
    isLeftPanelExpanded,
    isRightPanelExpanded,
    selectedNode: selectedNode?.id || 'none',
    selectedEdge: selectedEdge?.id || 'none'
  });

  console.log('🚨 DEBUG - Index.tsx received panel states:', {
    isRightPanelVisible,
    isRightPanelExpanded,
    timestamp: new Date().toISOString()
  });

  console.log('🚨 DEBUG - Index.tsx about to pass props to MainApplicationLayout:', {
    isRightPanelVisible,
    isRightPanelExpanded
  });

  console.log('📄 Index.tsx - Rendering Canvas component');

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
