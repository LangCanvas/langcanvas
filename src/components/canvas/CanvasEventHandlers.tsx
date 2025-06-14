
import React from 'react';
import { EnhancedNode } from '../../types/nodeTypes';
import { EnhancedEdge } from '../../types/edgeTypes';
import { useCanvasMouseEvents } from '../../hooks/useCanvasMouseEvents';
import EdgeCreationHandler from './EdgeCreationHandler';

interface CanvasEventHandlersProps {
  nodes: EnhancedNode[];
  edges: EnhancedEdge[];
  onAddEdge: any;
  canvasRef: React.RefObject<HTMLDivElement>;
  multiSelection: any;
  multiNodeDrag: any;
  canvasHandlers: any;
  pendingNodeType: any;
  children: (props: {
    isCreatingEdge: boolean;
    edgePreview: any;
    hoveredNodeId: string | null;
    handleStartConnection: any;
  }) => React.ReactNode;
}

const CanvasEventHandlers: React.FC<CanvasEventHandlersProps> = ({
  nodes,
  edges,
  onAddEdge,
  canvasRef,
  multiSelection,
  multiNodeDrag,
  canvasHandlers,
  pendingNodeType,
  children
}) => {
  return (
    <EdgeCreationHandler
      nodes={nodes}
      edges={edges}
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

        return children({
          isCreatingEdge,
          edgePreview,
          hoveredNodeId,
          handleStartConnection
        });
      }}
    </EdgeCreationHandler>
  );
};

export default CanvasEventHandlers;
