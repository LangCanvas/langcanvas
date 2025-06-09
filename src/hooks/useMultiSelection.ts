
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
  const selectionRectRef = useRef<SelectionRectangle | null>(null);
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
    selectionRectRef.current = null;
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
    const rect = { startX: x, startY: y, endX: x, endY: y };
    setIsSelecting(true);
    setSelectionRect(rect);
    selectionRectRef.current = rect;
  }, []);

  const updateRectangleSelection = useCallback((x: number, y: number) => {
    if (!selectionRectRef.current) {
      console.warn('🚨 updateRectangleSelection called with no active selection');
      return;
    }
    
    console.log('🔲 Updating rectangle selection to:', { x, y });
    const newRect = { ...selectionRectRef.current, endX: x, endY: y };
    
    setSelectionRect(newRect);
    selectionRectRef.current = newRect;
  }, []);

  const endRectangleSelection = useCallback((nodes: EnhancedNode[]) => {
    const currentRect = selectionRectRef.current;
    console.log('🔲 Ending rectangle selection with current rect:', currentRect);
    
    if (currentRect) {
      const width = Math.abs(currentRect.endX - currentRect.startX);
      const height = Math.abs(currentRect.endY - currentRect.startY);
      
      console.log('🔲 Selection rectangle size:', { width, height });
      
      if (width > 5 || height > 5) {
        selectNodesInRectangle(nodes, currentRect);
      } else {
        console.log('🔲 Rectangle too small, clearing selection instead');
        clearSelection();
      }
    } else {
      console.log('🔲 No rectangle found, clearing selection');
      clearSelection();
    }
    
    setSelectionRect(null);
    selectionRectRef.current = null;
    setIsSelecting(false);
  }, [selectNodesInRectangle, clearSelection]);

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
