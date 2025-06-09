
import { useState, useCallback, useRef } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { getNodeDimensions, isNodeInRectangle } from '../utils/canvasCoordinates';

export interface SelectionRectangle {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export const useMultiSelection = () => {
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState<SelectionRectangle | null>(null);
  const selectionRectRef = useRef<SelectionRectangle | null>(null);

  const selectSingleNode = useCallback((nodeId: string | null) => {
    console.log('🎯 Multi-selection: selectSingleNode called with:', nodeId);
    if (nodeId) {
      setSelectedNodeIds([nodeId]);
    } else {
      setSelectedNodeIds([]);
    }
  }, []);

  const toggleNodeSelection = useCallback((nodeId: string, isCtrlPressed: boolean, isShiftPressed: boolean = false, nodes: EnhancedNode[] = []) => {
    console.log('🎯 Multi-selection: toggleNodeSelection called with:', { nodeId, isCtrlPressed, isShiftPressed });
    
    if (isShiftPressed && nodes.length > 0) {
      // Shift key: range selection
      setSelectedNodeIds(prev => {
        if (prev.length === 0) {
          return [nodeId];
        }
        
        const firstSelectedId = prev[0];
        const firstIndex = nodes.findIndex(n => n.id === firstSelectedId);
        const clickedIndex = nodes.findIndex(n => n.id === nodeId);
        
        if (firstIndex === -1 || clickedIndex === -1) {
          return [nodeId];
        }
        
        const startIndex = Math.min(firstIndex, clickedIndex);
        const endIndex = Math.max(firstIndex, clickedIndex);
        const rangeNodeIds = nodes.slice(startIndex, endIndex + 1).map(n => n.id);
        
        console.log('🎯 Multi-selection: Shift+click range result:', rangeNodeIds);
        return rangeNodeIds;
      });
    } else if (isCtrlPressed) {
      // Ctrl/Cmd key: toggle selection
      setSelectedNodeIds(prev => {
        const newSelection = prev.includes(nodeId) 
          ? prev.filter(id => id !== nodeId)
          : [...prev, nodeId];
        console.log('🎯 Multi-selection: Ctrl+click result:', newSelection);
        return newSelection;
      });
    } else {
      // No modifier: single selection
      setSelectedNodeIds([nodeId]);
    }
  }, []);

  const selectNodesInRectangle = useCallback((nodes: EnhancedNode[], rect: SelectionRectangle) => {
    console.log('🔍 Selecting nodes in rectangle:', rect, 'Nodes available:', nodes.length);
    
    const rectLeft = Math.min(rect.startX, rect.endX);
    const rectRight = Math.max(rect.startX, rect.endX);
    const rectTop = Math.min(rect.startY, rect.endY);
    const rectBottom = Math.max(rect.startY, rect.endY);

    console.log('🔍 Rectangle bounds:', { rectLeft, rectRight, rectTop, rectBottom });

    const selectedNodes = nodes.filter(node => {
      const dimensions = getNodeDimensions(node.id);
      
      const intersects = isNodeInRectangle(
        node.x, 
        node.y, 
        dimensions.width, 
        dimensions.height,
        rectLeft, 
        rectTop, 
        rectRight, 
        rectBottom
      );

      console.log(`Node ${node.id} at position (${node.x}, ${node.y}) with size (${dimensions.width}x${dimensions.height}) - ${intersects ? 'SELECTED' : 'not selected'}`);
      
      return intersects;
    });

    const newSelection = selectedNodes.map(node => node.id);
    console.log('🎯 Selected nodes result:', newSelection);
    setSelectedNodeIds(newSelection);
  }, []);

  const clearSelection = useCallback(() => {
    console.log('🧹 Multi-selection: clearSelection called');
    setSelectedNodeIds([]);
  }, []);

  const startRectangleSelection = useCallback((x: number, y: number) => {
    console.log('🔲 Starting rectangle selection at:', { x, y });
    const rect = { startX: x, startY: y, endX: x, endY: y };
    setIsSelecting(true);
    setSelectionRect(rect);
    selectionRectRef.current = rect;
  }, []);

  const updateRectangleSelection = useCallback((x: number, y: number) => {
    console.log('🔲 Updating rectangle selection to:', { x, y });
    setSelectionRect(prev => {
      if (!prev) {
        console.warn('🚨 updateRectangleSelection called with no active selection');
        return null;
      }
      const newRect = { ...prev, endX: x, endY: y };
      console.log('🔲 New rectangle:', newRect);
      selectionRectRef.current = newRect;
      return newRect;
    });
  }, []);

  const endRectangleSelection = useCallback((nodes: EnhancedNode[]) => {
    const currentRect = selectionRectRef.current;
    console.log('🔲 Ending rectangle selection with current rect:', currentRect);
    
    if (currentRect) {
      // Only select if we've actually dragged a meaningful distance
      const width = Math.abs(currentRect.endX - currentRect.startX);
      const height = Math.abs(currentRect.endY - currentRect.startY);
      
      console.log('🔲 Selection rectangle size:', { width, height });
      
      if (width > 10 || height > 10) {
        selectNodesInRectangle(nodes, currentRect);
      } else {
        console.log('🔲 Rectangle too small, not selecting nodes');
      }
    }
    
    setSelectionRect(null);
    selectionRectRef.current = null;
    setIsSelecting(false);
  }, [selectNodesInRectangle]);

  return {
    selectedNodeIds,
    isSelecting,
    selectionRect,
    selectSingleNode,
    toggleNodeSelection,
    clearSelection,
    startRectangleSelection,
    updateRectangleSelection,
    endRectangleSelection,
  };
};
