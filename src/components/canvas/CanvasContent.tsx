
import React, { useState, useCallback } from 'react';
import { EnhancedNode } from '../../types/nodeTypes';
import { EnhancedEdge } from '../../types/edgeTypes';
import CanvasBackground from './CanvasBackground';
import EnhancedEdgeRenderer from '../EnhancedEdgeRenderer';
import RectangleSelector from './RectangleSelector';
import EdgePreview from './EdgePreview';
import CanvasNodes from './CanvasNodes';
import BottomStatusBar from '../layout/BottomStatusBar';
import KeyboardHandler from './KeyboardHandler';

interface CanvasContentProps {
  nodes: EnhancedNode[];
  edges: EnhancedEdge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  isMobile: boolean;
  multiSelection: any;
  nodeEvents: any;
  canvasHandlers: any;
  canCreateEdge: any;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  getNodeValidationClass?: (nodeId: string) => string;
  getEdgeValidationClass?: (edgeId: string) => string;
  getNodeTooltip?: (nodeId: string) => string;
  getEdgeTooltip?: (edgeId: string) => string;
  pendingNodeType?: any;
  hasUnsavedChanges?: boolean;
  isCreatingEdge: boolean;
  edgePreview: any;
  hoveredNodeId: string | null;
  handleStartConnection: any;
}

const CanvasContent: React.FC<CanvasContentProps> = ({
  nodes,
  edges,
  selectedNodeId,
  selectedEdgeId,
  isMobile,
  multiSelection,
  nodeEvents,
  canvasHandlers,
  canCreateEdge,
  onDeleteNode,
  onDeleteEdge,
  getNodeValidationClass,
  getEdgeValidationClass,
  getNodeTooltip,
  getEdgeTooltip,
  pendingNodeType,
  hasUnsavedChanges = false,
  isCreatingEdge,
  edgePreview,
  hoveredNodeId,
  handleStartConnection
}) => {
  const [advancedSelectedEdges, setAdvancedSelectedEdges] = useState<EnhancedEdge[]>([]);

  const handleSelectSingleEdge = (edgeId: string | null) => {
    canvasHandlers.selectEdgeSafely(edgeId);
    setAdvancedSelectedEdges(edgeId ? edges.filter(e => e.id === edgeId) : []);
  };
  
  const handleToggleEdgeSelection = (edgeId: string, isCtrlOrShiftPressed: boolean) => {
    multiSelection.toggleEdgeSelection(edgeId, isCtrlOrShiftPressed);
  };

  const handleEdgeDoubleClick = (edgeId: string) => {
    window.dispatchEvent(new CustomEvent('openPropertiesPanel', { 
      detail: { edgeId, type: 'edge' } 
    }));
  };

  const handleAdvancedEdgeSelection = useCallback((selectedEdges: EnhancedEdge[]) => {
    setAdvancedSelectedEdges(selectedEdges);
    console.log(`🔗 Advanced edge selection: ${selectedEdges.length} edges selected`);
  }, []);

  const totalSelectedCount = multiSelection.selectedNodeIds.length + 
                            multiSelection.selectedEdgeIds.length + 
                            advancedSelectedEdges.length;

  return (
    <>
      <KeyboardHandler
        selectedNodeId={selectedNodeId}
        selectedEdgeId={selectedEdgeId}
        onDeleteNode={onDeleteNode}
        onDeleteEdge={onDeleteEdge}
      />

      <CanvasBackground 
        isDragOver={false}
        isMobile={isMobile} 
        nodeCount={nodes.length} 
      />

      <EnhancedEdgeRenderer
        edges={edges}
        nodes={nodes}
        selectedEdgeId={selectedEdgeId}
        selectedEdgeIds={multiSelection.selectedEdgeIds}
        onSelectSingleEdge={handleSelectSingleEdge}
        onToggleEdgeSelection={handleToggleEdgeSelection}
        onDoubleClick={handleEdgeDoubleClick}
        getEdgeValidationClass={getEdgeValidationClass}
        getEdgeTooltip={getEdgeTooltip}
        enableMultiEdge={true}
        onSelectionChange={handleAdvancedEdgeSelection}
      />

      <RectangleSelector
        selectionRect={multiSelection.selectionRect}
        isSelecting={multiSelection.isSelecting}
      />

      <EdgePreview edgePreview={edgePreview} />

      <CanvasNodes
        nodes={nodes}
        edges={edges}
        selectedNodeId={selectedNodeId}
        selectedNodeIds={multiSelection.selectedNodeIds}
        hoveredNodeId={hoveredNodeId}
        isMobile={isMobile}
        canCreateEdge={canCreateEdge}
        onNodeSelect={nodeEvents.handleNodeSelect}
        onNodeDoubleClick={nodeEvents.handleNodeDoubleClick}
        onMoveNode={canvasHandlers.handleMoveNode}
        onNodeDragStart={nodeEvents.handleNodeDragStart}
        onStartConnection={handleStartConnection}
        getNodeValidationClass={getNodeValidationClass}
        getNodeTooltip={getNodeTooltip}
      />

      <BottomStatusBar
        isSelecting={multiSelection.isSelecting}
        selectedCount={totalSelectedCount}
        pendingNodeType={pendingNodeType}
        isCreatingEdge={isCreatingEdge}
        hasUnsavedChanges={hasUnsavedChanges}
      />
    </>
  );
};

export default CanvasContent;
