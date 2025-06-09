
import { useEffect, useRef } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { getCanvasCoordinates } from '../utils/canvasCoordinates';

interface UseCanvasMouseEventsProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  isSelecting: boolean;
  isMultiDragging: boolean;
  pendingNodeType: string | null;
  nodes: EnhancedNode[];
  startRectangleSelection: (x: number, y: number) => void;
  updateRectangleSelection: (x: number, y: number, nodes: EnhancedNode[]) => void;
  endRectangleSelection: () => void;
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
  const isMouseDownRef = useRef(false);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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
        
        isMouseDownRef.current = true;
        isDraggingRef.current = false;
        const coords = getCanvasCoordinates(event, canvasRef);
        
        console.log('🔲 Starting rectangle selection at:', coords);
        startRectangleSelection(coords.x, coords.y);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      console.log('🖱️ Mouse move detected, isMouseDown:', isMouseDownRef.current);
      
      if (!isMouseDownRef.current) {
        console.log('🚫 Mouse move ignored - not in selection mode');
        return;
      }

      // Mark that we're dragging after the first move
      if (!isDraggingRef.current) {
        isDraggingRef.current = true;
        console.log('🔲 Started dragging - rectangle should now be visible');
      }

      const currentCoords = getCanvasCoordinates(event, canvasRef);
      console.log('🔲 Updating rectangle selection to:', currentCoords, 'isSelecting:', isSelecting);
      updateRectangleSelection(currentCoords.x, currentCoords.y, nodes);
    };

    const handleMouseUp = (event: MouseEvent) => {
      console.log('🖱️ Mouse up:', { 
        isMouseDown: isMouseDownRef.current, 
        isDragging: isDraggingRef.current, 
        isSelecting 
      });
      
      if (isMouseDownRef.current) {
        if (isDraggingRef.current && isSelecting) {
          console.log('🔲 Ending rectangle selection after drag');
          endRectangleSelection();
        } else {
          // Simple click on canvas background without any dragging - clear all selections
          console.log('🧹 Canvas background click - clearing all selections');
          clearSelection();
          selectNodeSafely(null);
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
  }, [isSelecting, isMultiDragging, pendingNodeType, nodes, startRectangleSelection, updateRectangleSelection, endRectangleSelection, clearSelection, selectNodeSafely]);
};
