
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
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState<SelectionRectangle | null>(null);
  const lastSelectedNodeRef = useRef<string | null>(null);

  const selectSingleNode = useCallback((nodeId: string | null) => {
    setSelectedNodeIds(nodeId ? [nodeId] : []);
    setSelectedEdgeIds([]);
    lastSelectedNodeRef.current = nodeId;
  }, []);

  const selectSingleEdge = useCallback((edgeId: string | null) => {
    setSelectedEdgeIds(edgeId ? [edgeId] : []);
    setSelectedNodeIds([]);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedNodeIds([]);
    setSelectedEdgeIds([]);
    lastSelectedNodeRef.current = null;
  }, []);

  const clearNodeMultiSelection = useCallback(() => {
    setSelectedNodeIds([]);
    lastSelectedNodeRef.current = null;
  }, []);

  const clearEdgeMultiSelection = useCallback(() => {
    setSelectedEdgeIds([]);
  }, []);

  const toggleNodeSelection = useCallback((nodeId: string, isCtrlOrShiftPressed: boolean, nodes: EnhancedNode[] = []) => {
    if (isCtrlOrShiftPressed) {
      setSelectedNodeIds(prev => {
        const newSelection = prev.includes(nodeId) 
          ? prev.filter(id => id !== nodeId)
          : [...prev, nodeId];
        
        if (newSelection.includes(nodeId)) {
          lastSelectedNodeRef.current = nodeId;
        } else if (lastSelectedNodeRef.current === nodeId) {
          lastSelectedNodeRef.current = null;
        }
        
        return newSelection;
      });
      setSelectedEdgeIds([]);
    } else {
      setSelectedNodeIds([nodeId]);
      setSelectedEdgeIds([]);
      lastSelectedNodeRef.current = nodeId;
    }
  }, []);

  const toggleEdgeSelection = useCallback((edgeId: string, isCtrlOrShiftPressed: boolean) => {
    if (isCtrlOrShiftPressed) {
      setSelectedEdgeIds(prev => {
        const newSelection = prev.includes(edgeId)
          ? prev.filter(id => id !== edgeId)
          : [...prev, edgeId];
        return newSelection;
      });
      setSelectedNodeIds([]);
    } else {
      setSelectedEdgeIds([edgeId]);
      setSelectedNodeIds([]);
    }
  }, []);

  const updateNodesSelectionInRealTime = useCallback((nodes: EnhancedNode[], rect: SelectionRectangle) => {
    const rectLeft = Math.min(rect.startX, rect.endX);
    const rectRight = Math.max(rect.startX, rect.endX);
    const rectTop = Math.min(rect.startY, rect.endY);
    const rectBottom = Math.max(rect.startY, rect.endY);

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
    setSelectedEdgeIds([]);

    if (newSelection.length > 0) {
      lastSelectedNodeRef.current = newSelection[newSelection.length - 1];
    }
  }, [canvasRef]);

  const startRectangleSelection = useCallback((x: number, y: number) => {
    setIsSelecting(true);
    const newRect = { startX: x, startY: y, endX: x, endY: y };
    setSelectionRect(newRect);
    setSelectedEdgeIds([]);
  }, []);

  const updateRectangleSelection = useCallback((x: number, y: number, nodes: EnhancedNode[]) => {
    if (!selectionRect) {
      return;
    }
    
    const newRect = { 
      startX: selectionRect.startX, 
      startY: selectionRect.startY, 
      endX: x, 
      endY: y 
    };
    
    setSelectionRect(newRect);
    updateNodesSelectionInRealTime(nodes, newRect);
  }, [selectionRect, updateNodesSelectionInRealTime]);

  const endRectangleSelection = useCallback(() => {
    setSelectionRect(null);
    setIsSelecting(false);
  }, []);

  const cancelRectangleSelection = useCallback(() => {
    setSelectionRect(null);
    setIsSelecting(false);
    setSelectedNodeIds([]);
    setSelectedEdgeIds([]);
    lastSelectedNodeRef.current = null;
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSelecting) {
        event.preventDefault();
        cancelRectangleSelection();
      }
    };

    if (isSelecting) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isSelecting, cancelRectangleSelection]);

  return {
    selectedNodeIds,
    selectedEdgeIds,
    isSelecting,
    selectionRect,
    selectSingleNode,
    selectSingleEdge,
    toggleNodeSelection,
    toggleEdgeSelection,
    clearSelection,
    clearNodeMultiSelection,
    clearEdgeMultiSelection,
    startRectangleSelection,
    updateRectangleSelection,
    endRectangleSelection,
    cancelRectangleSelection,
  };
};
