import React from 'react';
import { EnhancedNode, NodeType } from '../types/nodeTypes';
import { EnhancedEdge } from '../types/edgeTypes';
import { useCanvasHandlers } from '../hooks/useCanvasHandlers';
import { useCanvasMouseEvents } from '../hooks/useCanvasMouseEvents';
import { useCanvasSelection } from '../hooks/useCanvasSelection';
import { useCanvasNodeEvents } from '../hooks/useCanvasNodeEvents';
import { useCanvasState } from '../hooks/useCanvasState';
import { useAStarPathfinding } from '../hooks/useAStarPathfinding';
import { ScrollArea } from '@/components/ui/scroll-area';
import DragDropHandler from './canvas/DragDropHandler';
import EdgeCreationHandler from './canvas/EdgeCreationHandler';
import CanvasBackground from './canvas/CanvasBackground';
import EdgePreview from './canvas/EdgePreview';
import KeyboardHandler from './canvas/KeyboardHandler';
import RectangleSelector from './canvas/RectangleSelector';
import CanvasNodes from './canvas/CanvasNodes';
import EnhancedEdgeRenderer from './EnhancedEdgeRenderer';
import BottomStatusBar from './layout/BottomStatusBar';

interface CanvasProps {
  className?: string;
  nodes: EnhancedNode[];
  edges: EnhancedEdge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  onAddNode: (type: NodeType, x: number, y: number) => EnhancedNode | null;
  onSelectNode: (id: string | null) => void;
  onSelectEdge: (id: string | null) => void;
  onMoveNode: (id: string, x: number, y: number) => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  onAddEdge: (sourceNode: EnhancedNode, targetNode: EnhancedNode) => { success: boolean; error?: string };
  canCreateEdge: (sourceNode: EnhancedNode) => boolean;
  getNodeValidationClass?: (nodeId: string) => string;
  getEdgeValidationClass?: (edgeId: string) => string;
  getNodeTooltip?: (nodeId: string) => string;
  getEdgeTooltip?: (edgeId: string) => string;
  pendingNodeType?: NodeType | null;
  onClearPendingCreation?: () => void;
  hasUnsavedChanges?: boolean;
  onSelectionStateChange?: (state: { isSelecting: boolean; selectedNodeCount: number; selectedEdgeCount: number }) => void;
}

const Canvas: React.FC<CanvasProps> = ({ 
  className, 
  nodes, 
  edges,
  selectedNodeId, 
  selectedEdgeId,
  onAddNode, 
  onSelectNode, 
  onSelectEdge,
  onMoveNode,
  onDeleteNode,
  onDeleteEdge,
  onAddEdge,
  canCreateEdge,
  getNodeValidationClass,
  getEdgeValidationClass,
  getNodeTooltip,
  getEdgeTooltip,
  pendingNodeType,
  onClearPendingCreation,
  hasUnsavedChanges = false,
  onSelectionStateChange
}) => {
  // Initialize A* pathfinding system
  const { getPathfindingStats } = useAStarPathfinding(nodes);

  const canvasState = useCanvasState({
    nodes,
    edges,
    onAddNode,
    onMoveNode,
  });

  const {
    canvasRef,
    scrollAreaRef,
    isMobile,
    createNodeWithAnalytics,
    multiSelection,
    multiNodeDrag,
  } = canvasState;

  const canvasHandlers = useCanvasHandlers({
    canvasRef,
    scrollAreaRef,
    onSelectNode,
    onSelectEdge,
    createNodeWithAnalytics,
    pendingNodeType,
    onClearPendingCreation,
    onMoveNode,
    nodes,
    selectSingleNode: multiSelection.selectSingleNode,
    selectSingleEdge: multiSelection.selectSingleEdge,
    clearSelection: multiSelection.clearSelection,
  });

  useCanvasSelection({
    selectedNodeId,
    selectedEdgeId,
    selectedNodeIds: multiSelection.selectedNodeIds,
    selectedEdgeIds: multiSelection.selectedEdgeIds,
    selectSingleNode: multiSelection.selectSingleNode,
    selectSingleEdge: multiSelection.selectSingleEdge,
    clearNodeMultiSelection: multiSelection.clearNodeMultiSelection,
    onSelectionStateChange,
    isSelecting: multiSelection.isSelecting,
  });

  const nodeEvents = useCanvasNodeEvents({
    toggleNodeSelection: multiSelection.toggleNodeSelection,
    selectNodeSafely: canvasHandlers.selectNodeSafely,
    selectSingleNode: multiSelection.selectSingleNode,
    startMultiDrag: multiNodeDrag.startDrag,
    nodes,
    selectedNodeIds: multiSelection.selectedNodeIds,
  });

  const handleSelectSingleEdge = (edgeId: string | null) => {
    canvasHandlers.selectEdgeSafely(edgeId);
  };
  
  const handleToggleEdgeSelection = (edgeId: string, isCtrlOrShiftPressed: boolean) => {
    multiSelection.toggleEdgeSelection(edgeId, isCtrlOrShiftPressed);
  };

  const handleEdgeDoubleClick = (edgeId: string) => {
    window.dispatchEvent(new CustomEvent('openPropertiesPanel', { 
      detail: { edgeId, type: 'edge' } 
    }));
  };

  return (
    <div className="h-full w-full relative" style={{ paddingBottom: '32px' }}>
      <ScrollArea ref={scrollAreaRef} className="w-full h-full">
        <DragDropHandler onAddNode={createNodeWithAnalytics}>
          <div
            ref={canvasRef}
            id="canvas"
            className={`relative transition-colors ${className} ${
              isMobile ? 'touch-pan-y' : ''
            } ${pendingNodeType ? 'cursor-crosshair' : ''} ${
              multiSelection.isSelecting ? 'cursor-crosshair' : ''
            }`}
            style={{
              width: '3000px',
              height: '3000px',
              minWidth: '100%',
              minHeight: '100%',
              touchAction: 'manipulation',
            }}
          >
            {/* Debug info for A* system in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white p-2 text-xs rounded z-50">
                A* Grid: {getPathfindingStats().gridSize} | Nodes: {getPathfindingStats().nodeCount}
              </div>
            )}

            <KeyboardHandler
              selectedNodeId={selectedNodeId}
              selectedEdgeId={selectedEdgeId}
              onDeleteNode={onDeleteNode}
              onDeleteEdge={onDeleteEdge}
            />

            <EdgeCreationHandler
              nodes={nodes}
              onAddEdge={onAddEdge}
              canvasRef={canvasRef}
            >
              {({ isCreatingEdge, edgePreview, hoveredNodeId, handleStartConnection }) => {
                useCanvasMouseEvents({
                  canvasRef,
                  isSelecting: multiSelection.isSelecting,
                  isMultiDragging: multiNodeDrag.isDragging,
                  isCreatingEdge,
                  pendingNodeType,
                  nodes,
                  startRectangleSelection: multiSelection.startRectangleSelection,
                  updateRectangleSelection: (x: number, y: number) => 
                    multiSelection.updateRectangleSelection(x, y, nodes),
                  endRectangleSelection: multiSelection.endRectangleSelection,
                  clearSelection: multiSelection.clearSelection,
                  selectNodeSafely: canvasHandlers.selectNodeSafely,
                  selectEdgeSafely: canvasHandlers.selectEdgeSafely,
                });

                return (
                  <>
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
                      selectedCount={multiSelection.selectedNodeIds.length + multiSelection.selectedEdgeIds.length}
                      pendingNodeType={pendingNodeType}
                      isCreatingEdge={isCreatingEdge}
                      hasUnsavedChanges={hasUnsavedChanges}
                    />
                  </>
                );
              }}
            </EdgeCreationHandler>
          </div>
        </DragDropHandler>
      </ScrollArea>
    </div>
  );
};

export default Canvas;
