import React from 'react';
import Canvas from '../components/Canvas';
import MainApplicationLayout from '../components/layout/MainApplicationLayout';
import { useWorkflowActions } from '../hooks/useWorkflowActions';
import { useIndexHandlers } from '../hooks/useIndexHandlers';
import { useIndexWorkflowHandlers } from '../hooks/useIndexWorkflowHandlers';
import { useIndexPanelHandlers } from '../hooks/useIndexPanelHandlers';
import { useIndexState } from '../hooks/useIndexState';
import { useChangeTracking } from '../hooks/useChangeTracking';
import { EnhancedEdge } from '../types/edgeTypes';
import { NodeType } from '../types/nodeTypes';

const Index = () => {
  const [selectionState, setSelectionState] = React.useState({
    isSelecting: false,
    selectedCount: 0
  });

  const {
    nodeState,
    edgeState,
    nodeCreation,
    workflowSerializer,
    validation
  } = useIndexState();

  const { hasUnsavedChanges, markAsChanged, markAsSaved } = useChangeTracking();

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

  // Enhanced handlers that track changes
  const handleAddNodeWithTracking = (type: NodeType, x: number, y: number) => {
    const result = nodeCreation.createNode(type, x, y);
    if (result) {
      markAsChanged();
    }
    return result;
  };

  const handleDeleteNodeWithTracking = (id: string) => {
    indexHandlers.handleDeleteNode(id);
    markAsChanged();
  };

  const handleDeleteEdgeWithTracking = (id: string) => {
    edgeState.deleteEdge(id);
    markAsChanged();
  };

  const handleUpdateNodePropertiesWithTracking = (id: string, updates: any) => {
    indexHandlers.handleUpdateNodeProperties(id, updates);
    markAsChanged();
  };

  const handleUpdateEdgePropertiesWithTracking = (id: string, updates: any) => {
    indexHandlers.handleUpdateEdgeProperties(id, updates);
    markAsChanged();
  };

  const handleAddEdgeWithTracking = (sourceNode: any, targetNode: any) => {
    const result = indexHandlers.handleAddEdge(sourceNode, targetNode);
    if (result.success) {
      markAsChanged();
    }
    return result;
  };

  const handleMoveNodeWithTracking = (id: string, x: number, y: number) => {
    nodeState.updateNodePosition(id, x, y);
    markAsChanged();
  };

  // Enhanced workflow handlers that track save state
  const handleExportWithTracking = () => {
    workflowActions.handleExport();
    markAsSaved();
  };

  const handleNewProjectWithTracking = () => {
    workflowActions.handleNewProject();
    markAsSaved();
  };

  const handleImportWithTracking = () => {
    workflowActions.handleImport();
    markAsSaved();
  };

  const workflowHandlers = useIndexWorkflowHandlers({
    handleNewProject: handleNewProjectWithTracking,
    handleImport: handleImportWithTracking,
    handleExport: handleExportWithTracking,
  });

  const panelHandlers = useIndexPanelHandlers(nodeCreation.clearPendingCreation);

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

  // Set up pending node creation event listener
  React.useEffect(() => {
    const handlePendingCreation = (event: CustomEvent) => {
      nodeCreation.setPendingCreation(event.detail);
    };

    const handleOpenPropertiesPanel = (event: CustomEvent) => {
      const { nodeId, edgeId, type } = event.detail;
      
      // Select the appropriate item
      if (type === 'node' && nodeId) {
        indexHandlers.handleSelectNode(nodeId);
      } else if (type === 'edge' && edgeId) {
        indexHandlers.handleSelectEdge(edgeId);
      }
      
      // Open right panel and expand it
      panelHandlers.handleExpandRightPanel();
      
      // Switch to properties panel if needed
      panelHandlers.switchToPropertiesPanel();
    };

    window.addEventListener('setPendingCreation', handlePendingCreation as EventListener);
    window.addEventListener('openPropertiesPanel', handleOpenPropertiesPanel as EventListener);
    
    return () => {
      window.removeEventListener('setPendingCreation', handlePendingCreation as EventListener);
      window.removeEventListener('openPropertiesPanel', handleOpenPropertiesPanel as EventListener);
    };
  }, [nodeCreation.setPendingCreation, indexHandlers.handleSelectNode, indexHandlers.handleSelectEdge, panelHandlers.handleExpandRightPanel, panelHandlers.switchToPropertiesPanel]);

  const handleUpdateEdgeWithCondition = (edgeId: string, updates: Partial<EnhancedEdge>) => {
    handleUpdateEdgePropertiesWithTracking(edgeId, updates);
    if (updates.conditional) {
      edgeState.updateEdgeCondition(edgeId, updates.conditional.condition);
    }
  };

  const handleCanvasSelectionChange = (state: { isSelecting: boolean; selectedNodeCount: number; selectedEdgeCount: number; }) => {
    setSelectionState({
      isSelecting: state.isSelecting,
      selectedCount: state.selectedNodeCount + state.selectedEdgeCount,
    });
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
        onDeleteNode={handleDeleteNodeWithTracking}
        onDeleteEdge={handleDeleteEdgeWithTracking}
        onUpdateNodeProperties={handleUpdateNodePropertiesWithTracking}
        onUpdateEdgeProperties={handleUpdateEdgeWithCondition}
        validatePriorityConflicts={edgeState.validatePriorityConflicts}
      >
        <Canvas
          nodes={nodeState.nodes}
          edges={edgeState.edges}
          selectedNodeId={nodeState.selectedNodeId}
          selectedEdgeId={edgeState.selectedEdgeId}
          onAddNode={handleAddNodeWithTracking}
          onSelectNode={indexHandlers.handleSelectNode}
          onSelectEdge={indexHandlers.handleSelectEdge}
          onMoveNode={handleMoveNodeWithTracking}
          onDeleteNode={handleDeleteNodeWithTracking}
          onDeleteEdge={handleDeleteEdgeWithTracking}
          onAddEdge={handleAddEdgeWithTracking}
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
