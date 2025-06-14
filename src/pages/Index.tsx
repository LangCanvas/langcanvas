import React from 'react';
import Canvas from '../components/Canvas';
import MainApplicationLayout from '../components/layout/MainApplicationLayout';
import { useWorkflowActions } from '../hooks/useWorkflowActions';
import { useIndexHandlers } from '../hooks/useIndexHandlers';
import { useIndexWorkflowHandlers } from '../hooks/useIndexWorkflowHandlers';
import { useIndexPanelHandlers } from '../hooks/useIndexPanelHandlers'; // Added import
import { useIndexState } from '../hooks/useIndexState';
import { useChangeTracking } from '../hooks/useChangeTracking';
import { useIndexSelectionState } from '../hooks/useIndexSelectionState';
import { useIndexChangeTrackedHandlers } from '../hooks/useIndexChangeTrackedHandlers';
import { useIndexEventListeners } from '../hooks/useIndexEventListeners';
import { EnhancedEdge } from '../types/edgeTypes';
// NodeType import was unused after refactor, removed.

const Index = () => {
  const {
    nodeState,
    edgeState,
    nodeCreation,
    workflowSerializer,
    validation
  } = useIndexState();

  const changeTracking = useChangeTracking();
  const { hasUnsavedChanges } = changeTracking;

  const { selectionState, handleCanvasSelectionChange } = useIndexSelectionState();

  // Initialize panelHandlers
  const panelHandlers = useIndexPanelHandlers(nodeCreation.clearPendingCreation);

  // Original action/handler hooks
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

  // New hook for change-tracked handlers
  const trackedHandlers = useIndexChangeTrackedHandlers({
    nodeCreation,
    nodeState,
    edgeState,
    indexHandlers,
    workflowActions,
    changeTracking,
  });

  // Enhanced workflow handlers (using some tracked handlers)
  const workflowHandlers = useIndexWorkflowHandlers({
    handleNewProject: trackedHandlers.handleNewProjectWithTracking,
    handleImport: trackedHandlers.handleImportWithTracking,
    handleExport: trackedHandlers.handleExportWithTracking,
  });
  
  // Setup event listeners using the new hook
  useIndexEventListeners({
    nodeCreation,
    indexHandlers, // Passed to useIndexEventListeners
    panelHandlers, // Passed to useIndexEventListeners
  });

  console.log("📍 Index component rendering - DEBUG STATE:");
  console.log("📍 Panel handlers state:", {
    isLeftPanelVisible: panelHandlers.isLeftPanelVisible,
    isLeftPanelExpanded: panelHandlers.isLeftPanelExpanded,
    isRightPanelVisible: panelHandlers.isRightPanelVisible,
    isRightPanelExpanded: panelHandlers.isRightPanelExpanded
  });
  console.log("📍 Panel handlers functions:", {
    handleToggleRightPanel: !!panelHandlers.handleToggleRightPanel,
    handleExpandRightPanel: !!panelHandlers.handleExpandRightPanel
  });

  // Redundant useEffect for 'setPendingCreation' and 'openPropertiesPanel' removed
  // as useIndexEventListeners now handles this.

  const handleUpdateEdgeWithCondition = (edgeId: string, updates: Partial<EnhancedEdge>) => {
    // Corrected to use trackedHandlers
    trackedHandlers.handleUpdateEdgePropertiesWithTracking(edgeId, updates);
    if (updates.conditional) {
      edgeState.updateEdgeCondition(edgeId, updates.conditional.condition);
    }
  };

  return (
    <div style={{ backgroundColor: '#fef3c7' }} className="min-h-screen">
      <div className="absolute top-0 left-0 bg-orange-500 text-white px-3 py-1 text-xs z-50 rounded-br">
        INDEX DEBUG - Right Panel: {panelHandlers.isRightPanelVisible ? 'VISIBLE' : 'HIDDEN'} / {panelHandlers.isRightPanelExpanded ? 'EXPANDED' : 'COLLAPSED'}
      </div>
      
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
        isSelecting={selectionState.isSelecting}
        selectedCount={selectionState.selectedCount}
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
        onDeleteNode={trackedHandlers.handleDeleteNodeWithTracking}
        onDeleteEdge={trackedHandlers.handleDeleteEdgeWithTracking}
        onUpdateNodeProperties={trackedHandlers.handleUpdateNodePropertiesWithTracking}
        onUpdateEdgeProperties={handleUpdateEdgeWithCondition}
        validatePriorityConflicts={edgeState.validatePriorityConflicts}
      >
        <Canvas
          nodes={nodeState.nodes}
          edges={edgeState.edges}
          selectedNodeId={nodeState.selectedNodeId}
          selectedEdgeId={edgeState.selectedEdgeId}
          onAddNode={trackedHandlers.handleAddNodeWithTracking}
          onSelectNode={indexHandlers.handleSelectNode} 
          onSelectEdge={indexHandlers.handleSelectEdge} 
          onMoveNode={trackedHandlers.handleMoveNodeWithTracking}
          onDeleteNode={trackedHandlers.handleDeleteNodeWithTracking}
          onDeleteEdge={trackedHandlers.handleDeleteEdgeWithTracking}
          onAddEdge={trackedHandlers.handleAddEdgeWithTracking}
          canCreateEdge={edgeState.canCreateEdge}
          getNodeValidationClass={validation.getNodeErrorClass}
          getEdgeValidationClass={validation.getEdgeErrorClass}
          getNodeTooltip={validation.getNodeTooltip}
          getEdgeTooltip={validation.getEdgeTooltip}
          pendingNodeType={nodeCreation.pendingNodeType}
          onClearPendingCreation={nodeCreation.clearPendingCreation}
          hasUnsavedChanges={hasUnsavedChanges}
          onSelectionStateChange={handleCanvasSelectionChange}
        />
      </MainApplicationLayout>
    </div>
  );
};

export default Index;
