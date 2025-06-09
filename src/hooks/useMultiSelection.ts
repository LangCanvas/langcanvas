
import { useState, useCallback, useRef, useEffect } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { isNodeInRectangle, getNodesBoundingBox } from '../utils/canvasCoordinates';

export interface SelectionRectangle {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export const useMultiSelection = (canvasRef: React.RefObject<HTMLDivElement>) => {
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState<SelectionRectangle | null>(null);
  const lastSelectedNodeRef = useRef<string | null>(null);

  const selectSingleNode = useCallback((nodeId: string | null) => {
    console.log('🎯 Multi-selection: selectSingleNode called with:', nodeId);
    if (nodeId) {
      setSelectedNodeIds([nodeId]);
      lastSelectedNodeRef.current = nodeId;
    } else {
      setSelectedNodeIds([]);
      lastSelectedNodeRef.current = null;
    }
  }, []);

  const clearSelection = useCallback(() => {
    console.log('🧹 Multi-selection: clearSelection called');
    setSelectedNodeIds([]);
    lastSelectedNodeRef.current = null;
  }, []);

  // Clear multi-selection when edge is selected
  const clearMultiSelection = useCallback(() => {
    console.log('🧹 Multi-selection: clearMultiSelection called (edge selected)');
    setSelectedNodeIds([]);
    lastSelectedNodeRef.current = null;
    setIsSelecting(false);
    setSelectionRect(null);
  }, []);

  const toggleNodeSelection = useCallback((nodeId: string, isCtrlPressed: boolean, isShiftPressed: boolean = false, nodes: EnhancedNode[] = []) => {
    console.log('🎯 Multi-selection: toggleNodeSelection called with:', { nodeId, isCtrlPressed, isShiftPressed });
    
    if (isShiftPressed && lastSelectedNodeRef.current && nodes.length > 0) {
      // Shift key: spatial range selection
      setSelectedNodeIds(prev => {
        const lastSelectedId = lastSelectedNodeRef.current;
        if (!lastSelectedId) {
          lastSelectedNodeRef.current = nodeId;
          return [nodeId];
        }
        
        // Get bounding box of the two nodes
        const boundingBox = getNodesBoundingBox([lastSelectedId, nodeId], canvasRef);
        if (!boundingBox) {
          lastSelectedNodeRef.current = nodeId;
          return [nodeId];
        }
        
        // Select all nodes within the bounding box
        const nodesInRange = nodes.filter(node => 
          isNodeInRectangle(
            node.id,
            canvasRef,
            boundingBox.minX,
            boundingBox.minY,
            boundingBox.maxX,
            boundingBox.maxY
          )
        );
        
        const rangeNodeIds = nodesInRange.map(n => n.id);
        console.log('🎯 Multi-selection: Shift+click spatial range result:', rangeNodeIds);
        return rangeNodeIds;
      });
    } else if (isCtrlPressed) {
      // Ctrl/Cmd key: toggle selection
      setSelectedNodeIds(prev => {
        const newSelection = prev.includes(nodeId) 
          ? prev.filter(id => id !== nodeId)
          : [...prev, nodeId];
        
        if (newSelection.includes(nodeId)) {
          lastSelectedNodeRef.current = nodeId;
        }
        
        console.log('🎯 Multi-selection: Ctrl+click result:', newSelection);
        return newSelection;
      });
    } else {
      // No modifier: single selection
      setSelectedNodeIds([nodeId]);
      lastSelectedNodeRef.current = nodeId;
    }
  }, [canvasRef]);

  const updateNodesSelectionInRealTime = useCallback((nodes: EnhancedNode[], rect: SelectionRectangle) => {
    const rectLeft = Math.min(rect.startX, rect.endX);
    const rectRight = Math.max(rect.startX, rect.endX);
    const rectTop = Math.min(rect.startY, rect.endY);
    const rectBottom = Math.max(rect.startY, rect.endY);

    console.log('🔍 Real-time selection update:', {
      rect: { left: rectLeft, right: rectRight, top: rectTop, bottom: rectBottom },
      width: rectRight - rectLeft,
      height: rectBottom - rectTop
    });

    const selectedNodes = nodes.filter(node => {
      return isNodeInRectangle(
        node.id,
        canvasRef,
        rectLeft, 
        rectTop, 
        rectRight, 
        rectBottom
      );
    });

    const newSelection = selectedNodes.map(node => node.id);
    setSelectedNodeIds(newSelection);
    
    if (newSelection.length > 0) {
      lastSelectedNodeRef.current = newSelection[newSelection.length - 1];
    }
  }, [canvasRef]);

  const startRectangleSelection = useCallback((x: number, y: number) => {
    console.log('🔲 Starting rectangle selection at:', { x, y });
    setIsSelecting(true);
    // Start with a point rectangle
    const newRect = { startX: x, startY: y, endX: x, endY: y };
    setSelectionRect(newRect);
    console.log('🔲 Initial rectangle set:', newRect);
  }, []);

  const updateRectangleSelection = useCallback((x: number, y: number, nodes: EnhancedNode[]) => {
    console.log('🔲 updateRectangleSelection called with:', { x, y, hasSelectionRect: !!selectionRect });
    
    if (!selectionRect) {
      console.warn('🚨 updateRectangleSelection called with no selection rectangle');
      return;
    }
    
    // Create new rectangle
    const newRect = { 
      startX: selectionRect.startX, 
      startY: selectionRect.startY, 
      endX: x, 
      endY: y 
    };
    
    console.log('🔲 Updating rectangle from', selectionRect, 'to', newRect);
    console.log('🔲 Rectangle dimensions:', {
      width: Math.abs(newRect.endX - newRect.startX),
      height: Math.abs(newRect.endY - newRect.startY)
    });
    
    setSelectionRect(newRect);
    
    // Update selected nodes in real-time
    updateNodesSelectionInRealTime(nodes, newRect);
  }, [selectionRect, updateNodesSelectionInRealTime]);

  const endRectangleSelection = useCallback(() => {
    console.log('🔲 Ending rectangle selection');
    
    // Keep the current selection and just clean up the rectangle
    setSelectionRect(null);
    setIsSelecting(false);
  }, []);

  const cancelRectangleSelection = useCallback(() => {
    console.log('🔲 Canceling rectangle selection');
    
    // Clear everything
    setSelectionRect(null);
    setIsSelecting(false);
    setSelectedNodeIds([]);
    lastSelectedNodeRef.current = null;
  }, []);

  // Add escape key handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSelecting) {
        console.log('🔲 Escape pressed during selection - canceling');
        event.preventDefault();
        cancelRectangleSelection();
      }
    };

    if (isSelecting) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isSelecting, cancelRectangleSelection]);

  // Debug logging for rectangle state changes
  useEffect(() => {
    if (selectionRect) {
      console.log('🔲 Rectangle state changed:', selectionRect, 'isSelecting:', isSelecting);
    }
  }, [selectionRect, isSelecting]);

  return {
    selectedNodeIds,
    isSelecting,
    selectionRect,
    selectSingleNode,
    toggleNodeSelection,
    clearSelection,
    clearMultiSelection,
    startRectangleSelection,
    updateRectangleSelection,
    endRectangleSelection,
    cancelRectangleSelection,
  };
};
