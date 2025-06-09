
import React from 'react';
import Canvas from '../components/Canvas';
import MainApplicationLayout from '../components/layout/MainApplicationLayout';
import { useWorkflowActions } from '../hooks/useWorkflowActions';
import { useIndexHandlers } from '../hooks/useIndexHandlers';
import { useIndexWorkflowHandlers } from '../hooks/useIndexWorkflowHandlers';
import { useIndexPanelHandlers } from '../hooks/useIndexPanelHandlers';
import { useIndexState } from '../hooks/useIndexState';
import { EnhancedEdge } from '../types/edgeTypes';

const Index = () => {
  const {
    nodeState,
    edgeState,
    nodeCreation,
    workflowSerializer,
    validation
  } = useIndexState();

  const workflowActions = useWorkflowActions({
    nodes: nodeState.nodes,
    exportWorkflowAsString: workflowSerializer.exportWorkflowAsString,
    importWorkflow: workflowSerializer.importWorkflow,
    validateWorkflow: workflowSerializer.validateWorkflow,
    clearWorkflow: workflowSerializer.clearWorkflow,
    validationResult: validation.validationResult
  });

  const indexHandlers = useIndexHandlers({
    nodes: nodeState.nodes,
    deleteEdgesForNode: edgeState.deleteEdgesForNode,
    deleteNode: nodeState.deleteNode,
    deleteEdge: edgeState.deleteEdge,
    addEdge: edgeState.addEdge,
    selectNode: nodeState.selectNode,
    selectEdge: edgeState.selectEdge,
    updateNodeProperties: nodeState.updateNodeProperties,
    updateEdgeProperties: edgeState.updateEdgeProperties,
  });

  const workflowHandlers = useIndexWorkflowHandlers({
    handleNewProject: workflowActions.handleNewProject,
    handleImport: workflowActions.handleImport,
    handleExport: workflowActions.handleExport,
  });

  const panelHandlers = useIndexPanelHandlers(nodeCreation.clearPendingCreation);

  // Set up pending node creation event listener
  React.useEffect(() => {
    const handlePendingCreation = (event: CustomEvent) => {
      nodeCreation.setPendingCreation(event.detail);
    };

    window.addEventListener('setPendingCreation', handlePendingCreation as EventListener);
    return () => {
      window.removeEventListener('setPendingCreation', handlePendingCreation as EventListener);
    };
  }, [nodeCreation.setPendingCreation]);

  console.log("📍 Index component rendering");
  console.log("📍 Validation result:", validation.validationResult);

  const handleUpdateEdgeWithCondition = (edgeId: string, updates: Partial<EnhancedEdge>) => {
    indexHandlers.handleUpdateEdgeProperties(edgeId, updates);
    if (updates.conditional) {
      edgeState.updateEdgeCondition(edgeId, updates.conditional.condition);
    }
  };

  return (
    <MainApplicationLayout
      isMobileMenuOpen={panelHandlers.isMobileMenuOpen}
      activePanel={panelHandlers.activePanel}
      showValidationPanel={panelHandlers.showValidationPanel}
      isLeftPanelVisible={panelHandlers.isLeftPanelVisible}
      isLeftPanelExpanded={panelHandlers.isLeftPanelExpanded}
      isRightPanelVisible={panelHandlers.isRightPanelVisible}
      isRightPanelExpanded={panelHandlers.isRightPanelExpanded}
      nodes={nodeState.nodes}
      edges={edgeState.edges}
      selectedNode={nodeState.selectedNode}
      selectedEdge={edgeState.selectedEdge}
      validationResult={validation.validationResult}
      onMobileMenuToggle={panelHandlers.handleMobileMenuToggle}
      onPanelToggle={panelHandlers.handlePanelToggle}
      onToggleLeftPanel={panelHandlers.handleToggleLeftPanel}
      onToggleRightPanel={panelHandlers.handleToggleRightPanel}
      onExpandLeftPanel={panelHandlers.handleExpandLeftPanel}
      onExpandRightPanel={panelHandlers.handleExpandRightPanel}
      closePanels={panelHandlers.closePanels}
      setShowValidationPanel={panelHandlers.setShowValidationPanel}
      switchToPropertiesPanel={panelHandlers.switchToPropertiesPanel}
      onNewProject={workflowHandlers.handleNewProjectWithAnalytics}
      onImport={workflowHandlers.handleImportWithAnalytics}
      onExport={workflowHandlers.handleExportWithAnalytics}
      onDeleteNode={indexHandlers.handleDeleteNode}
      onDeleteEdge={edgeState.deleteEdge}
      onUpdateNodeProperties={indexHandlers.handleUpdateNodeProperties}
      onUpdateEdgeProperties={handleUpdateEdgeWithCondition}
      validatePriorityConflicts={edgeState.validatePriorityConflicts}
    >
      <Canvas
        nodes={nodeState.nodes}
        edges={edgeState.edges}
        selectedNodeId={nodeState.selectedNodeId}
        selectedEdgeId={edgeState.selectedEdgeId}
        onAddNode={nodeCreation.createNode}
        onSelectNode={indexHandlers.handleSelectNode}
        onSelectEdge={indexHandlers.handleSelectEdge}
        onMoveNode={nodeState.updateNodePosition}
        onDeleteNode={indexHandlers.handleDeleteNode}
        onDeleteEdge={edgeState.deleteEdge}
        onAddEdge={indexHandlers.handleAddEdge}
        canCreateEdge={edgeState.canCreateEdge}
        getNodeValidationClass={validation.getNodeErrorClass}
        getEdgeValidationClass={validation.getEdgeErrorClass}
        getNodeTooltip={validation.getNodeTooltip}
        getEdgeTooltip={validation.getEdgeTooltip}
        pendingNodeType={nodeCreation.pendingNodeType}
        onClearPendingCreation={nodeCreation.clearPendingCreation}
      />
    </MainApplicationLayout>
  );
};

export default Index;
