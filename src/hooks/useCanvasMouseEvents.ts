import { useEffect, useRef } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { getCanvasCoordinates } from '../utils/canvasCoordinates';

interface UseCanvasMouseEventsProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  isSelecting: boolean; // Rectangle selection mode
  isMultiDragging: boolean;
  pendingNodeType: string | null;
  nodes: EnhancedNode[];
  startRectangleSelection: (x: number, y: number) => void;
  updateRectangleSelection: (x: number, y: number, nodes: EnhancedNode[]) => void;
  endRectangleSelection: () => void;
  clearSelection: () => void; // From useMultiSelection (clears node & edge multi-selection)
  selectNodeSafely: (nodeId: string | null) => void; // Clears primary edge, sets primary node, updates multi-select
  selectEdgeSafely: (edgeId: string | null) => void; // Clears primary node, sets primary edge, updates multi-select
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
  selectEdgeSafely,
}: UseCanvasMouseEventsProps) => {
  const isMouseDownRef = useRef(false);
  const isDraggingRef = useRef(false); // For rectangle selection drag

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (event: MouseEvent) => {
      // ... keep existing code (target identification, logging)
      const target = event.target as HTMLElement;
      
      console.log('🖱️ Canvas mousedown:', {
        target: target.tagName,
        className: target.className,
        hasNode: !!target.closest('[data-node-id]'),
        hasSVG: !!target.closest('svg'), // Check for SVG elements (like edges)
        hasHandle: !!target.closest('.connection-handle'),
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        metaKey: event.metaKey
      });
      
      // Don't interfere if clicking on a node, edge, or other UI elements.
      // Edges are SVG elements, so closest('svg') might catch them.
      // A more specific check for edges might be needed if 'svg' is too broad.
      if (target.closest('[data-node-id]') || 
          target.closest('line, path, polyline, g') || // More specific for SVG parts of edges
          target.closest('.connection-handle') ||
          pendingNodeType ||
          isMultiDragging) {
        console.log('🚫 Mousedown ignored - interacting with UI element or edge');
        return;
      }

      // Only start tracking on canvas background
      if (target === canvas || target.closest('.canvas-background')) {
        // ... keep existing code (preventDefault, isMouseDownRef, startRectangleSelection)
        console.log('✅ Valid mousedown on canvas background');
        event.preventDefault();
        
        isMouseDownRef.current = true;
        isDraggingRef.current = false; // Reset drag state for rectangle selection
        const coords = getCanvasCoordinates(event, canvasRef);
        
        console.log('🔲 Starting rectangle selection at:', coords);
        startRectangleSelection(coords.x, coords.y);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      // ... keep existing code (handling for rectangle selection drag)
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
        isSelectingRect: isSelecting 
      });
      
      if (isMouseDownRef.current) {
        if (isDraggingRef.current && isSelecting) { // isSelecting is true during rectangle drag
          console.log('🔲 Ending rectangle selection after drag');
          endRectangleSelection();
        } else {
          // Simple click on canvas background without any dragging for rectangle selection
          // Check if the click was actually on the canvas background
          const target = event.target as HTMLElement;
          if (target === canvasRef.current || target.closest('.canvas-background')) {
             console.log('🧹 Canvas background click - clearing all selections');
             clearSelection(); // Clears multi-selected nodes and edges
             selectNodeSafely(null); // Clears primary selected node
             selectEdgeSafely(null); // Clears primary selected edge
          }
        }
      }
      
      // Reset state
      isMouseDownRef.current = false;
      isDraggingRef.current = false;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove); // Listen on document for drag outside canvas
    document.addEventListener('mouseup', handleMouseUp);     // Listen on document for mouse up anywhere

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [canvasRef, isSelecting, isMultiDragging, pendingNodeType, nodes, startRectangleSelection, updateRectangleSelection, endRectangleSelection, clearSelection, selectNodeSafely, selectEdgeSafely]); // Added selectEdgeSafely
};
