
import { useState, useCallback } from 'react';
import { EnhancedNode } from '../types/nodeTypes';

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
    if (nodeId) {
      setSelectedNodeIds([nodeId]);
    } else {
      setSelectedNodeIds([]);
    }
  }, []);

  const toggleNodeSelection = useCallback((nodeId: string, isCtrlPressed: boolean) => {
    if (isCtrlPressed) {
      setSelectedNodeIds(prev => 
        prev.includes(nodeId) 
          ? prev.filter(id => id !== nodeId)
          : [...prev, nodeId]
      );
    } else {
      setSelectedNodeIds([nodeId]);
    }
  }, []);

  const getNodeDimensions = (node: EnhancedNode) => {
    if (node.type === 'conditional') {
      return { width: 80, height: 80 };
    }
    return { width: 120, height: 60 };
  };

  const selectNodesInRectangle = useCallback((nodes: EnhancedNode[], rect: SelectionRectangle) => {
    console.log('🔍 Selecting nodes in rectangle:', rect, 'Nodes available:', nodes.length);
    
    const rectLeft = Math.min(rect.startX, rect.endX);
    const rectRight = Math.max(rect.startX, rect.endX);
    const rectTop = Math.min(rect.startY, rect.endY);
    const rectBottom = Math.max(rect.startY, rect.endY);

    console.log('🔍 Rectangle bounds:', { rectLeft, rectRight, rectTop, rectBottom });

    const selectedNodes = nodes.filter(node => {
      const { width, height } = getNodeDimensions(node);
      const nodeLeft = node.x;
      const nodeRight = node.x + width;
      const nodeTop = node.y;
      const nodeBottom = node.y + height;

      // Check if node overlaps with rectangle
      const isIntersecting = (
        nodeLeft < rectRight &&
        nodeRight > rectLeft &&
        nodeTop < rectBottom &&
        nodeBottom > rectTop
      );

      console.log(`Node ${node.id} at (${nodeLeft}, ${nodeTop}, ${nodeRight}, ${nodeBottom}) - ${isIntersecting ? 'SELECTED' : 'not selected'}`);
      
      return isIntersecting;
    });

    console.log('🎯 Selected nodes:', selectedNodes.map(n => n.id));
    setSelectedNodeIds(selectedNodes.map(node => node.id));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedNodeIds([]);
  }, []);

  const startRectangleSelection = useCallback((x: number, y: number) => {
    console.log('🔲 Starting rectangle selection at:', { x, y });
    setIsSelecting(true);
    setSelectionRect({ startX: x, startY: y, endX: x, endY: y });
  }, []);

  const updateRectangleSelection = useCallback((x: number, y: number) => {
    if (selectionRect) {
      setSelectionRect(prev => prev ? { ...prev, endX: x, endY: y } : null);
    }
  }, [selectionRect]);

  const endRectangleSelection = useCallback((nodes: EnhancedNode[]) => {
    console.log('🔲 Ending rectangle selection with rect:', selectionRect);
    if (selectionRect) {
      // Only select if we've actually dragged a meaningful distance
      const width = Math.abs(selectionRect.endX - selectionRect.startX);
      const height = Math.abs(selectionRect.endY - selectionRect.startY);
      
      if (width > 10 || height > 10) {
        selectNodesInRectangle(nodes, selectionRect);
      }
    }
    setIsSelecting(false);
    setSelectionRect(null);
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
