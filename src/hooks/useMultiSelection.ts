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
    console.log('🎯 Multi-selection: selectSingleNode called with:', nodeId);
    setSelectedNodeIds(nodeId ? [nodeId] : []);
    setSelectedEdgeIds([]);
    lastSelectedNodeRef.current = nodeId;
  }, []);

  const selectSingleEdge = useCallback((edgeId: string | null) => {
    console.log('🎯 Multi-selection: selectSingleEdge called with:', edgeId);
    setSelectedEdgeIds(edgeId ? [edgeId] : []);
    setSelectedNodeIds([]);
  }, []);

  const clearSelection = useCallback(() => {
    console.log('🧹 Multi-selection: clearSelection called');
    setSelectedNodeIds([]);
    setSelectedEdgeIds([]);
    lastSelectedNodeRef.current = null;
  }, []);

  const clearNodeMultiSelection = useCallback(() => {
    console.log('🧹 Multi-selection: clearNodeMultiSelection called');
    setSelectedNodeIds([]);
    lastSelectedNodeRef.current = null;
  }, []);

  const clearEdgeMultiSelection = useCallback(() => {
    console.log('🧹 Multi-selection: clearEdgeMultiSelection called');
    setSelectedEdgeIds([]);
  }, []);

  const toggleNodeSelection = useCallback((nodeId: string, isCtrlOrShiftPressed: boolean, nodes: EnhancedNode[] = []) => {
    console.log('🎯 Multi-selection: toggleNodeSelection called with:', { nodeId, isCtrlOrShiftPressed });
    
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
        
        console.log('🎯 Multi-selection: Ctrl/Shift+click node result:', newSelection);
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
    console.log('🎯 Multi-selection: toggleEdgeSelection called with:', { edgeId, isCtrlOrShiftPressed });

    if (isCtrlOrShiftPressed) {
      setSelectedEdgeIds(prev => {
        const newSelection = prev.includes(edgeId)
          ? prev.filter(id => id !== edgeId)
          : [...prev, edgeId];
        console.log('🎯 Multi-selection: Ctrl/Shift+click edge result:', newSelection);
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

    console.log('🔍 Real-time rectangle selection update:', {
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
    setSelectedEdgeIds([]);

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
    setSelectedEdgeIds([]);
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
    setSelectionRect(null);
    setIsSelecting(false);
  }, []);

  const cancelRectangleSelection = useCallback(() => {
    console.log('🔲 Canceling rectangle selection');
    setSelectionRect(null);
    setIsSelecting(false);
    setSelectedNodeIds([]);
    setSelectedEdgeIds([]);
    lastSelectedNodeRef.current = null;
  }, []);

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

  useEffect(() => {
    if (selectionRect) {
      console.log('🔲 Rectangle state changed:', selectionRect, 'isSelecting:', isSelecting);
    }
  }, [selectionRect, isSelecting]);

  useEffect(() => {
    console.log('📊 MultiSelection State:', {
      selectedNodeIds,
      selectedEdgeIds,
      isSelectingRect: isSelecting,
      lastSelectedNode: lastSelectedNodeRef.current
    });
  }, [selectedNodeIds, selectedEdgeIds, isSelecting]);

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
