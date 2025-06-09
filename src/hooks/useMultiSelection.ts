
import { useState, useCallback } from 'react';
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

  const selectSingleNode = useCallback((nodeId: string | null) => {
    console.log('🎯 Multi-selection: selectSingleNode called with:', nodeId);
    if (nodeId) {
      setSelectedNodeIds([nodeId]);
    } else {
      setSelectedNodeIds([]);
    }
  }, []);

  const toggleNodeSelection = useCallback((nodeId: string, isCtrlPressed: boolean) => {
    console.log('🎯 Multi-selection: toggleNodeSelection called with:', { nodeId, isCtrlPressed });
    if (isCtrlPressed) {
      setSelectedNodeIds(prev => {
        const newSelection = prev.includes(nodeId) 
          ? prev.filter(id => id !== nodeId)
          : [...prev, nodeId];
        console.log('🎯 Multi-selection: Ctrl+click result:', newSelection);
        return newSelection;
      });
    } else {
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
      
      // Use node's stored position (which should be in canvas coordinates)
      // and the dimensions from DOM measurement
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

      console.log(`Node ${node.id} at stored position (${node.x}, ${node.y}) with size (${dimensions.width}x${dimensions.height}) - ${intersects ? 'SELECTED' : 'not selected'}`);
      
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
    setIsSelecting(true);
    setSelectionRect({ startX: x, startY: y, endX: x, endY: y });
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
      return newRect;
    });
  }, []);

  const endRectangleSelection = useCallback((nodes: EnhancedNode[]) => {
    console.log('🔲 Ending rectangle selection with current rect:', selectionRect);
    if (selectionRect) {
      // Only select if we've actually dragged a meaningful distance
      const width = Math.abs(selectionRect.endX - selectionRect.startX);
      const height = Math.abs(selectionRect.endY - selectionRect.startY);
      
      console.log('🔲 Selection rectangle size:', { width, height });
      
      if (width > 10 || height > 10) {
        selectNodesInRectangle(nodes, selectionRect);
      } else {
        console.log('🔲 Rectangle too small, not selecting nodes');
      }
    }
    
    setSelectionRect(null);
    setIsSelecting(false);
  }, [selectionRect, selectNodesInRectangle]);

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
