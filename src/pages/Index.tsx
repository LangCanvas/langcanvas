
import React, { useState } from 'react';
import NodePalette from '../components/NodePalette';
import Canvas from '../components/Canvas';
import EnhancedPropertiesPanel from '../components/EnhancedPropertiesPanel';
import ValidationPanel from '../components/ValidationPanel';
import Toolbar from '../components/layout/Toolbar';
import MobileMenu from '../components/layout/MobileMenu';
import MobileBottomNav from '../components/layout/MobileBottomNav';
import MobilePanelOverlay from '../components/layout/MobilePanelOverlay';
import { useEnhancedNodes } from '../hooks/useEnhancedNodes';
import { useEdges } from '../hooks/useEdges';
import { useNodeCreation } from '../hooks/useNodeCreation';
import { useWorkflowSerializer } from '../hooks/useWorkflowSerializer';
import { useWorkflowActions } from '../hooks/useWorkflowActions';
import { useValidation } from '../hooks/useValidation';
import { useEnhancedAnalytics } from '../hooks/useEnhancedAnalytics';

const Index = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'palette' | 'properties' | null>(null);
  const [showValidationPanel, setShowValidationPanel] = useState(false);
  
  // Initialize analytics
  const analytics = useEnhancedAnalytics();
  
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
    deleteEdge,
    deleteEdgesForNode,
    selectEdge,
    canCreateEdge,
    getNodeOutgoingEdges
  } = useEdges();

  // Enhanced node creation with deduplication
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

  // Add validation hook
  const {
    validationResult,
    getNodeTooltip,
    getEdgeTooltip,
    getNodeErrorClass,
    getEdgeErrorClass
  } = useValidation({ nodes, edges });

  console.log("📍 Index component rendering");
  console.log("📍 Validation result:", validationResult);

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

  // Enhanced handlers with analytics tracking
  const handleDeleteNode = (nodeId: string) => {
    deleteEdgesForNode(nodeId);
    deleteNode(nodeId);
    
    // Track node deletion
    analytics.trackFeatureUsage('node_deleted', { nodeId });
  };

  const handleAddEdge = (sourceNode: any, targetNode: any) => {
    const result = addEdge(sourceNode, targetNode);
    
    // Track edge creation
    if (result.success) {
      analytics.trackEdgeCreated(sourceNode.type, targetNode.type);
    }
    
    return result;
  };

  const handleSelectNode = (nodeId: string | null) => {
    selectNode(nodeId);
    
    // Track node selection
    if (nodeId && analytics.isEnabled) {
      const node = nodes.find(n => n.id === nodeId);
      analytics.trackFeatureUsage('node_selected', { 
        nodeId, 
        nodeType: node?.type 
      });
    }
  };

  const handleSelectEdge = (edgeId: string | null) => {
    selectEdge(edgeId);
    
    // Track edge selection
    if (edgeId && analytics.isEnabled) {
      analytics.trackFeatureUsage('edge_selected', { edgeId });
    }
  };

  const handleUpdateNodeProperties = (nodeId: string, properties: any) => {
    updateNodeProperties(nodeId, properties);
    
    // Track property changes
    analytics.trackFeatureUsage('node_properties_updated', { 
      nodeId, 
      properties: Object.keys(properties) 
    });
  };

  const handleUpdateEdgeProperties = (edgeId: string, properties: any) => {
    updateEdgeProperties(edgeId, properties);
    
    // Track edge property changes
    analytics.trackFeatureUsage('edge_properties_updated', { 
      edgeId, 
      properties: Object.keys(properties) 
    });
  };

  // Enhanced workflow handlers with analytics
  const handleNewProjectWithAnalytics = () => {
    handleNewProject();
    analytics.trackFeatureUsage('new_project_created');
  };

  const handleImportWithAnalytics = () => {
    handleImport();
    // Note: actual import tracking happens in useWorkflowActions when import succeeds
  };

  const handleExportWithAnalytics = () => {
    handleExport();
    // Note: actual export tracking happens in useWorkflowActions when export succeeds
  };

  const handleMobileMenuToggle = () => {
    console.log("Mobile menu toggle clicked");
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setActivePanel(null);
    
    // Track mobile menu usage
    analytics.trackFeatureUsage('mobile_menu_toggled', { 
      isOpen: !isMobileMenuOpen 
    });
  };

  const handlePanelToggle = (panel: 'palette' | 'properties') => {
    console.log(`Panel toggle clicked: ${panel}`);
    const newActivePanel = activePanel === panel ? null : panel;
    setActivePanel(newActivePanel);
    
    // Track panel usage
    analytics.trackFeatureUsage('panel_toggled', { 
      panel, 
      isOpen: newActivePanel === panel 
    });
  };

  const closePanels = () => {
    console.log("Closing panels");
    setActivePanel(null);
    setIsMobileMenuOpen(false);
    setShowValidationPanel(false);
    clearPendingCreation();
    
    // Track panel closure
    analytics.trackFeatureUsage('panels_closed');
  };

  const nodeOutgoingEdges = selectedNode ? getNodeOutgoingEdges(selectedNode.id) : [];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Toolbar
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={handleMobileMenuToggle}
        onNewProject={handleNewProjectWithAnalytics}
        onImport={handleImportWithAnalytics}
        onExport={handleExportWithAnalytics}
        hasNodes={nodes.length > 0}
        validationResult={validationResult}
      />

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={closePanels}
        onNewProject={handleNewProjectWithAnalytics}
        onImport={handleImportWithAnalytics}
        onExport={handleExportWithAnalytics}
        onPanelToggle={handlePanelToggle}
        hasNodes={nodes.length > 0}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Left Sidebar - Node Palette */}
        <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col">
          <NodePalette onNodeTypeSelect={setPendingCreation} />
        </aside>

        <MobilePanelOverlay
          activePanel={activePanel}
          onClose={closePanels}
          onPanelToggle={handlePanelToggle}
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          onDeleteNode={handleDeleteNode}
          onDeleteEdge={deleteEdge}
          onUpdateNodeProperties={handleUpdateNodeProperties}
          onUpdateEdgeProperties={handleUpdateEdgeProperties}
          allNodes={nodes}
          nodeOutgoingEdges={nodeOutgoingEdges}
          validationResult={validationResult}
        />

        {/* Main Canvas Area */}
        <main className="flex-1 relative overflow-auto">
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
        </main>

        {/* Desktop Right Sidebar - Enhanced Properties Panel */}
        <aside className="hidden lg:flex w-80 bg-white border-l border-gray-200 flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-700">Properties</h2>
            {validationResult.issues.length > 0 && (
              <button
                onClick={() => setShowValidationPanel(!showValidationPanel)}
                className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ValidationPanel validationResult={validationResult} compact />
              </button>
            )}
          </div>
          
          {showValidationPanel ? (
            <ValidationPanel 
              validationResult={validationResult} 
              onClose={() => setShowValidationPanel(false)}
            />
          ) : (
            <EnhancedPropertiesPanel 
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              allNodes={nodes}
              onUpdateNode={handleUpdateNodeProperties}
              onUpdateEdge={handleUpdateEdgeProperties}
              onDeleteNode={handleDeleteNode}
              onDeleteEdge={deleteEdge}
            />
          )}
        </aside>
      </div>

      <MobileBottomNav
        onPanelToggle={handlePanelToggle}
        hasNodes={nodes.length > 0}
        validationResult={validationResult}
      />
    </div>
  );
};

export default Index;
