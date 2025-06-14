import { useState, useCallback, useRef, useEffect } from 'react';
import { EnhancedNode } from '../types/nodeTypes';

const DRAG_THRESHOLD = 5;

interface DragState {
  isDragging: boolean;
  primaryNodeId: string | null;
  dragOffset: { x: number; y: number };
  initialPositions: Map<string, { x: number; y: number }>;
  startX: number;
  startY: number;
}

export const useMultiNodeDrag = (
  selectedNodeIds: string[],
  nodes: EnhancedNode[],
  onMoveNode: (id: string, x: number, y: number) => void
) => {
  const dragStateRef = useRef<DragState>({
    isDragging: false,
    primaryNodeId: null,
    dragOffset: { x: 0, y: 0 },
    initialPositions: new Map(),
    startX: 0,
    startY: 0,
  });

  const [isVisualDragging, setVisualDragging] = useState(false);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    const { clientX, clientY } = event;
    if (!dragStateRef.current.initialPositions.size || !dragStateRef.current.primaryNodeId) return;

    if (dragStateRef.current.isDragging) {
      const canvas = document.getElementById('canvas');
      const canvasRect = canvas?.getBoundingClientRect();
      if (!canvasRect) return;

      const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
      const scrollLeft = scrollContainer?.scrollLeft || 0;
      const scrollTop = scrollContainer?.scrollTop || 0;

      const canvasX = clientX - canvasRect.left + scrollLeft;
      const canvasY = clientY - canvasRect.top + scrollTop;
      
      const primaryNodeInitial = dragStateRef.current.initialPositions.get(dragStateRef.current.primaryNodeId);
      if (primaryNodeInitial) {
        const newPrimaryX = canvasX - dragStateRef.current.dragOffset.x;
        const newPrimaryY = canvasY - dragStateRef.current.dragOffset.y;
        const deltaX = newPrimaryX - primaryNodeInitial.x;
        const deltaY = newPrimaryY - primaryNodeInitial.y;

        dragStateRef.current.initialPositions.forEach((initialPos, nodeId) => {
          const node = nodes.find(n => n.id === nodeId);
          const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`) as HTMLElement;
          const nodeWidth = node && nodeElement ? nodeElement.offsetWidth : 120;
          const nodeHeight = node && nodeElement ? nodeElement.offsetHeight : 60;

          const constrainedX = Math.max(0, Math.min(initialPos.x + deltaX, 3000 - nodeWidth));
          const constrainedY = Math.max(0, Math.min(initialPos.y + deltaY, 3000 - nodeHeight));
          onMoveNode(nodeId, constrainedX, constrainedY);
        });
      }
    } else {
      const dx = clientX - dragStateRef.current.startX;
      const dy = clientY - dragStateRef.current.startY;

      if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
        dragStateRef.current.isDragging = true;
        setVisualDragging(true);

        const canvas = document.getElementById('canvas');
        const canvasRect = canvas?.getBoundingClientRect();
        if (!canvasRect) return;

        const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
        const scrollLeft = scrollContainer?.scrollLeft || 0;
        const scrollTop = scrollContainer?.scrollTop || 0;

        const canvasX = clientX - canvasRect.left + scrollLeft;
        const canvasY = clientY - canvasRect.top + scrollTop;

        const primaryNodeInitialPos = dragStateRef.current.initialPositions.get(dragStateRef.current.primaryNodeId);

        if (primaryNodeInitialPos) {
            dragStateRef.current.dragOffset = {
                x: canvasX - primaryNodeInitialPos.x,
                y: canvasY - primaryNodeInitialPos.y,
            };
        }
        console.log('🎯 Starting multi-drag with offset:', dragStateRef.current.dragOffset);
      }
    }
  }, [onMoveNode, nodes]);

  const handlePointerUp = useCallback(() => {
    if (dragStateRef.current.isDragging) {
      console.log('🎯 Ending multi-drag');
    }
    dragStateRef.current = {
      isDragging: false,
      primaryNodeId: null,
      dragOffset: { x: 0, y: 0 },
      initialPositions: new Map(),
      startX: 0,
      startY: 0,
    };
    setVisualDragging(false);

    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
  }, [handlePointerMove]);

  const startDrag = useCallback((nodeId: string, clientX: number, clientY: number) => {
    const initialPositions = new Map();
    selectedNodeIds.forEach(id => {
      const node = nodes.find(n => n.id === id);
      if (node) {
        initialPositions.set(id, { x: node.x, y: node.y });
      }
    });

    if (initialPositions.size === 0) return;

    console.log('🎯 Preparing multi-drag for nodes:', [...initialPositions.keys()]);
    
    dragStateRef.current = {
      isDragging: false,
      primaryNodeId: nodeId,
      dragOffset: { x: 0, y: 0 },
      initialPositions,
      startX: clientX,
      startY: clientY,
    };
    setVisualDragging(false);

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  }, [selectedNodeIds, nodes, handlePointerMove, handlePointerUp]);

  useEffect(() => {
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  return {
    isDragging: isVisualDragging,
    startDrag,
  };
};
