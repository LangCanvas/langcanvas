
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

  const selectNodesInRectangle = useCallback((nodes: EnhancedNode[], rect: SelectionRectangle) => {
    const selectedNodes = nodes.filter(node => {
      const nodeLeft = node.x;
      const nodeRight = node.x + 120; // Node width
      const nodeTop = node.y;
      const nodeBottom = node.y + 60; // Node height

      const rectLeft = Math.min(rect.startX, rect.endX);
      const rectRight = Math.max(rect.startX, rect.endX);
      const rectTop = Math.min(rect.startY, rect.endY);
      const rectBottom = Math.max(rect.startY, rect.endY);

      return (
        nodeLeft < rectRight &&
        nodeRight > rectLeft &&
        nodeTop < rectBottom &&
        nodeBottom > rectTop
      );
    });

    setSelectedNodeIds(selectedNodes.map(node => node.id));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedNodeIds([]);
  }, []);

  const startRectangleSelection = useCallback((x: number, y: number) => {
    setIsSelecting(true);
    setSelectionRect({ startX: x, startY: y, endX: x, endY: y });
  }, []);

  const updateRectangleSelection = useCallback((x: number, y: number) => {
    if (selectionRect) {
      setSelectionRect(prev => prev ? { ...prev, endX: x, endY: y } : null);
    }
  }, [selectionRect]);

  const endRectangleSelection = useCallback((nodes: EnhancedNode[]) => {
    if (selectionRect) {
      selectNodesInRectangle(nodes, selectionRect);
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
