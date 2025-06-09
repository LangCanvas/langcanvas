
import { useEffect } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { getCanvasCoordinates } from '../utils/canvasCoordinates';

interface UseCanvasMouseEventsProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  isSelecting: boolean;
  isMultiDragging: boolean;
  pendingNodeType: string | null;
  nodes: EnhancedNode[];
  startRectangleSelection: (x: number, y: number) => void;
  updateRectangleSelection: (x: number, y: number) => void;
  endRectangleSelection: (nodes: EnhancedNode[]) => void;
  clearSelection: () => void;
  selectNodeSafely: (nodeId: string | null) => void;
}

export const useCanvasMouseEvents = ({
  canvasRef,
  isSelecting,
  isMultiDragging,
  pendingNodeType,
  nodes,
  startRectangleSelection,
  updateRectangleSelection,
  endRectangleSelection,
  clearSelection,
  selectNodeSafely,
}: UseCanvasMouseEventsProps) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isMouseDown = false;
    let isDragging = false;
    let startCoords: { x: number; y: number } | null = null;
    let hasStartedSelection = false;

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      console.log('🖱️ Canvas mousedown:', {
        target: target.tagName,
        className: target.className,
        hasNode: !!target.closest('[data-node-id]'),
        hasSVG: !!target.closest('svg'),
        hasHandle: !!target.closest('.connection-handle'),
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        metaKey: event.metaKey
      });
      
      // Don't interfere with node interactions or other UI elements
      if (target.closest('[data-node-id]') || 
          target.closest('svg') || 
          target.closest('.connection-handle') ||
          pendingNodeType ||
          isMultiDragging) {
        console.log('🚫 Mousedown ignored - interacting with UI element');
        return;
      }

      // Only start tracking on canvas background
      if (target === canvas || target.closest('.canvas-background')) {
        console.log('✅ Valid mousedown on canvas background');
        event.preventDefault();
        
        isMouseDown = true;
        isDragging = false;
        hasStartedSelection = false;
        startCoords = getCanvasCoordinates(event, canvasRef);
        
        console.log('🔲 Mouse down at canvas coords:', startCoords);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isMouseDown || !startCoords) return;

      const currentCoords = getCanvasCoordinates(event, canvasRef);
      const deltaX = Math.abs(currentCoords.x - startCoords.x);
      const deltaY = Math.abs(currentCoords.y - startCoords.y);

      // Start rectangle selection only after minimum movement and only once
      if (!isDragging && !hasStartedSelection && (deltaX > 3 || deltaY > 3)) {
        console.log('🔲 Starting rectangle selection on first drag movement');
        isDragging = true;
        hasStartedSelection = true;
        startRectangleSelection(startCoords.x, startCoords.y);
      }
      
      // Update rectangle selection if we're dragging
      if (isDragging && isSelecting) {
        updateRectangleSelection(currentCoords.x, currentCoords.y);
      }
    };

    const handleMouseUp = (event: MouseEvent) => {
      console.log('🖱️ Mouse up:', { isMouseDown, isDragging, isSelecting, hasStartedSelection });
      
      if (isMouseDown) {
        if (isDragging && isSelecting && hasStartedSelection) {
          console.log('🔲 Ending rectangle selection');
          endRectangleSelection(nodes);
        } else if (!isDragging && !hasStartedSelection) {
          // Simple click on canvas background without any dragging - clear all selections
          console.log('🧹 Canvas background click - clearing all selections');
          clearSelection();
          selectNodeSafely(null);
        }
      }
      
      // Reset state
      isMouseDown = false;
      isDragging = false;
      hasStartedSelection = false;
      startCoords = null;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSelecting, isMultiDragging, pendingNodeType, nodes, startRectangleSelection, updateRectangleSelection, endRectangleSelection, clearSelection, selectNodeSafely]);
};
