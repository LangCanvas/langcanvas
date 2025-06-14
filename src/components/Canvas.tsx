
import React from 'react';
import { EnhancedNode, NodeType } from '../types/nodeTypes';
import { EnhancedEdge } from '../types/edgeTypes';
import { useCanvasSetup } from '../hooks/useCanvasSetup';
import { ScrollArea } from '@/components/ui/scroll-area';
import DragDropHandler from './canvas/DragDropHandler';
import CanvasEventHandlers from './canvas/CanvasEventHandlers';
import CanvasContent from './canvas/CanvasContent';

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
  const {
    canvasRef,
    scrollAreaRef,
    isMobile,
    getPathfindingStats,
    multiSelection,
    multiNodeDrag,
    canvasHandlers,
    nodeEvents,
    createNodeWithAnalytics
  } = useCanvasSetup({
    nodes,
    edges,
    selectedNodeId,
    selectedEdgeId,
    onAddNode,
    onSelectNode,
    onSelectEdge,
    onMoveNode,
    pendingNodeType,
    onClearPendingCreation,
    onSelectionStateChange
  });

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

            <CanvasEventHandlers
              nodes={nodes}
              edges={edges}
              onAddEdge={onAddEdge}
              canvasRef={canvasRef}
              multiSelection={multiSelection}
              multiNodeDrag={multiNodeDrag}
              canvasHandlers={canvasHandlers}
              pendingNodeType={pendingNodeType}
            >
              {({ isCreatingEdge, edgePreview, hoveredNodeId, handleStartConnection }) => (
                <CanvasContent
                  nodes={nodes}
                  edges={edges}
                  selectedNodeId={selectedNodeId}
                  selectedEdgeId={selectedEdgeId}
                  isMobile={isMobile}
                  multiSelection={multiSelection}
                  nodeEvents={nodeEvents}
                  canvasHandlers={canvasHandlers}
                  canCreateEdge={canCreateEdge}
                  onDeleteNode={onDeleteNode}
                  onDeleteEdge={onDeleteEdge}
                  getNodeValidationClass={getNodeValidationClass}
                  getEdgeValidationClass={getEdgeValidationClass}
                  getNodeTooltip={getNodeTooltip}
                  getEdgeTooltip={getEdgeTooltip}
                  pendingNodeType={pendingNodeType}
                  hasUnsavedChanges={hasUnsavedChanges}
                  isCreatingEdge={isCreatingEdge}
                  edgePreview={edgePreview}
                  hoveredNodeId={hoveredNodeId}
                  handleStartConnection={handleStartConnection}
                />
              )}
            </CanvasEventHandlers>
          </div>
        </DragDropHandler>
      </ScrollArea>
    </div>
  );
};

export default Canvas;
