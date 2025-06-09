
import { useState, useCallback, useRef } from 'react';
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
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null);
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
    selectionStartRef.current = null;
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

  const selectNodesInRectangle = useCallback((nodes: EnhancedNode[], rect: SelectionRectangle) => {
    console.log('🔍 Selecting nodes in rectangle:', rect, 'Nodes available:', nodes.length);
    
    const rectLeft = Math.min(rect.startX, rect.endX);
    const rectRight = Math.max(rect.startX, rect.endX);
    const rectTop = Math.min(rect.startY, rect.endY);
    const rectBottom = Math.max(rect.startY, rect.endY);

    console.log('🔍 Rectangle bounds:', { rectLeft, rectRight, rectTop, rectBottom });

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
    console.log('🎯 Selected nodes result:', newSelection);
    setSelectedNodeIds(newSelection);
    
    if (newSelection.length > 0) {
      lastSelectedNodeRef.current = newSelection[newSelection.length - 1];
    }
  }, [canvasRef]);

  const startRectangleSelection = useCallback((x: number, y: number) => {
    console.log('🔲 Starting rectangle selection at:', { x, y });
    // Only set isSelecting and store start coordinates - don't create rectangle yet
    setIsSelecting(true);
    selectionStartRef.current = { x, y };
    setSelectionRect(null); // Ensure no rectangle is shown initially
  }, []);

  const updateRectangleSelection = useCallback((x: number, y: number) => {
    const startCoords = selectionStartRef.current;
    if (!startCoords) {
      console.warn('🚨 updateRectangleSelection called with no start coordinates');
      return;
    }
    
    console.log('🔲 Updating rectangle selection to:', { x, y });
    
    // Calculate rectangle dimensions
    const width = Math.abs(x - startCoords.x);
    const height = Math.abs(y - startCoords.y);
    
    // Only show rectangle if it's larger than minimum threshold (10px)
    if (width > 10 || height > 10) {
      const newRect = { 
        startX: startCoords.x, 
        startY: startCoords.y, 
        endX: x, 
        endY: y 
      };
      setSelectionRect(newRect);
    } else {
      // Don't show rectangle for small movements
      setSelectionRect(null);
    }
  }, []);

  const endRectangleSelection = useCallback((nodes: EnhancedNode[]) => {
    const startCoords = selectionStartRef.current;
    const currentRect = selectionRect;
    
    console.log('🔲 Ending rectangle selection with:', { startCoords, currentRect });
    
    if (currentRect && startCoords) {
      const width = Math.abs(currentRect.endX - currentRect.startX);
      const height = Math.abs(currentRect.endY - currentRect.startY);
      
      console.log('🔲 Selection rectangle size:', { width, height });
      
      if (width > 10 || height > 10) {
        selectNodesInRectangle(nodes, currentRect);
      } else {
        console.log('🔲 Rectangle too small, clearing selection instead');
        clearSelection();
      }
    } else {
      console.log('🔲 No rectangle found, clearing selection');
      clearSelection();
    }
    
    // Reset all selection state
    setSelectionRect(null);
    selectionStartRef.current = null;
    setIsSelecting(false);
  }, [selectionRect, selectNodesInRectangle, clearSelection]);

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
  };
};
