
import React from 'react';
import Canvas from '../components/Canvas';
import MainApplicationLayout from '../components/layout/MainApplicationLayout';
import { useEnhancedNodes } from '../hooks/useEnhancedNodes';
import { useEnhancedEdges } from '../hooks/useEnhancedEdges';
import { useNodeCreation } from '../hooks/useNodeCreation';
import { useWorkflowSerializer } from '../hooks/useWorkflowSerializer';
import { useWorkflowActions } from '../hooks/useWorkflowActions';
import { useValidation } from '../hooks/useValidation';
import { useIndexHandlers } from '../hooks/useIndexHandlers';
import { useIndexWorkflowHandlers } from '../hooks/useIndexWorkflowHandlers';
import { useIndexPanelHandlers } from '../hooks/useIndexPanelHandlers';
import { EnhancedEdge } from '../types/edgeTypes';

const Index = () => {
  const { 
    nodes, 
    selectedNode, 
    selectedNodeId, 
    addNode, 
    updateNodePosition, 
    updateNodeProperties,
    deleteNode, 
    selectNode 
  } = useEnhancedNodes();

  const {
    edges,
    selectedEdge,
    selectedEdgeId,
    addEdge,
    updateEdgeProperties,
    updateEdgeCondition,
    reorderConditionalEdges,
    deleteEdge,
    deleteEdgesForNode,
    selectEdge,
    canCreateEdge,
    getNodeOutgoingEdges,
    getConditionalNodeEdges,
    validatePriorityConflicts
  } = useEnhancedEdges();

  const {
    createNode,
    pendingNodeType,
    setPendingCreation,
    clearPendingCreation
  } = useNodeCreation({ onAddNode: addNode });

  const {
    exportWorkflow,
    exportWorkflowAsString,
    importWorkflow,
    validateWorkflow,
    clearWorkflow
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
    getNodeTooltip,
    getEdgeTooltip,
    getNodeErrorClass,
    getEdgeErrorClass
  } = useValidation({ nodes, edges });

  const {
    handleNewProject,
    handleImport,
    handleExport
  } = useWorkflowActions({
    nodes,
    exportWorkflowAsString,
    importWorkflow,
    validateWorkflow,
    clearWorkflow,
    validationResult
  });

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
    handleNewProjectWithAnalytics,
    handleImportWithAnalytics,
    handleExportWithAnalytics,
  } = useIndexWorkflowHandlers({
    handleNewProject,
    handleImport,
    handleExport,
  });

  const {
    isMobileMenuOpen,
    activePanel,
    showValidationPanel,
    setShowValidationPanel,
    isLeftPanelVisible,
    isRightPanelVisible,
    handleMobileMenuToggle,
    handlePanelToggle,
    handleToggleLeftPanel,
    handleToggleRightPanel,
    closePanels,
    switchToPropertiesPanel,
  } = useIndexPanelHandlers(clearPendingCreation);

  React.useEffect(() => {
    const handlePendingCreation = (event: CustomEvent) => {
      setPendingCreation(event.detail);
    };

    window.addEventListener('setPendingCreation', handlePendingCreation as EventListener);
    return () => {
      window.removeEventListener('setPendingCreation', handlePendingCreation as EventListener);
    };
  }, [setPendingCreation]);

  console.log("📍 Index component rendering");
  console.log("📍 Validation result:", validationResult);

  const handleUpdateEdgeWithCondition = (edgeId: string, updates: Partial<EnhancedEdge>) => {
    handleUpdateEdgeProperties(edgeId, updates);
    if (updates.conditional) {
      updateEdgeCondition(edgeId, updates.conditional.condition);
    }
  };

  return (
    <MainApplicationLayout
      isMobileMenuOpen={isMobileMenuOpen}
      activePanel={activePanel}
      showValidationPanel={showValidationPanel}
      isLeftPanelVisible={isLeftPanelVisible}
      isRightPanelVisible={isRightPanelVisible}
      nodes={nodes}
      edges={edges}
      selectedNode={selectedNode}
      selectedEdge={selectedEdge}
      validationResult={validationResult}
      onMobileMenuToggle={handleMobileMenuToggle}
      onPanelToggle={handlePanelToggle}
      onToggleLeftPanel={handleToggleLeftPanel}
      onToggleRightPanel={handleToggleRightPanel}
      closePanels={closePanels}
      setShowValidationPanel={setShowValidationPanel}
      switchToPropertiesPanel={switchToPropertiesPanel}
      onNewProject={handleNewProjectWithAnalytics}
      onImport={handleImportWithAnalytics}
      onExport={handleExportWithAnalytics}
      onDeleteNode={handleDeleteNode}
      onDeleteEdge={deleteEdge}
      onUpdateNodeProperties={handleUpdateNodeProperties}
      onUpdateEdgeProperties={handleUpdateEdgeWithCondition}
      validatePriorityConflicts={validatePriorityConflicts}
    >
      <Canvas
        nodes={nodes}
        edges={edges}
        selectedNodeId={selectedNodeId}
        selectedEdgeId={selectedEdgeId}
        onAddNode={createNode}
        onSelectNode={handleSelectNode}
        onSelectEdge={handleSelectEdge}
        onMoveNode={updateNodePosition}
        onDeleteNode={handleDeleteNode}
        onDeleteEdge={deleteEdge}
        onAddEdge={handleAddEdge}
        canCreateEdge={canCreateEdge}
        getNodeValidationClass={getNodeErrorClass}
        getEdgeValidationClass={getEdgeErrorClass}
        getNodeTooltip={getNodeTooltip}
        getEdgeTooltip={getEdgeTooltip}
        pendingNodeType={pendingNodeType}
        onClearPendingCreation={clearPendingCreation}
      />
    </MainApplicationLayout>
  );
};

export default Index;
