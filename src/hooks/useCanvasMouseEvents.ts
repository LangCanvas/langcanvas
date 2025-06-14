
import { useEffect, useRef } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { getCanvasCoordinates } from '../utils/canvasCoordinates';

interface UseCanvasMouseEventsProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  isSelecting: boolean;
  isMultiDragging: boolean;
  isCreatingEdge?: boolean; // Add edge creation state
  pendingNodeType: string | null;
  nodes: EnhancedNode[];
  startRectangleSelection: (x: number, y: number) => void;
  updateRectangleSelection: (x: number, y: number, nodes: EnhancedNode[]) => void;
  endRectangleSelection: () => void;
  clearSelection: () => void;
  selectNodeSafely: (nodeId: string | null) => void;
  selectEdgeSafely: (edgeId: string | null) => void;
}

export const useCanvasMouseEvents = ({
  canvasRef,
  isSelecting,
  isMultiDragging,
  isCreatingEdge = false,
  pendingNodeType,
  nodes,
  startRectangleSelection,
  updateRectangleSelection,
  endRectangleSelection,
  clearSelection,
  selectNodeSafely,
  selectEdgeSafely,
}: UseCanvasMouseEventsProps) => {
  const isMouseDownRef = useRef(false);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Don't interfere if:
      // - Clicking on a node, edge, or handle
      // - Currently creating an edge
      // - In pending node creation mode
      // - Currently multi-dragging
      if (target.closest('[data-node-id]') || 
          target.closest('line, path, polyline, g') ||
          target.closest('[data-handle]') ||
          isCreatingEdge ||
          pendingNodeType ||
          isMultiDragging) {
        return;
      }

      // Only start tracking on canvas background
      if (target === canvas || target.closest('.canvas-background')) {
        event.preventDefault();
        
        isMouseDownRef.current = true;
        isDraggingRef.current = false;
        const coords = getCanvasCoordinates(event, canvasRef);
        
        startRectangleSelection(coords.x, coords.y);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isMouseDownRef.current || isCreatingEdge) {
        return;
      }

      // Mark that we're dragging after the first move
      if (!isDraggingRef.current) {
        isDraggingRef.current = true;
      }

      const currentCoords = getCanvasCoordinates(event, canvasRef);
      updateRectangleSelection(currentCoords.x, currentCoords.y, nodes);
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (isMouseDownRef.current) {
        if (isDraggingRef.current && isSelecting) {
          endRectangleSelection();
        } else {
          // Simple click on canvas background
          const target = event.target as HTMLElement;
          if (target === canvasRef.current || target.closest('.canvas-background')) {
             clearSelection();
             selectNodeSafely(null);
             selectEdgeSafely(null);
          }
        }
      }
      
      // Reset state
      isMouseDownRef.current = false;
      isDraggingRef.current = false;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [canvasRef, isSelecting, isMultiDragging, isCreatingEdge, pendingNodeType, nodes, startRectangleSelection, updateRectangleSelection, endRectangleSelection, clearSelection, selectNodeSafely, selectEdgeSafely]);
};
