
import { useState, useCallback, useRef } from 'react';
import { EnhancedNode } from '../types/nodeTypes';

interface DragState {
  isDragging: boolean;
  dragOffset: { x: number; y: number };
  initialPositions: Map<string, { x: number; y: number }>;
}

export const useMultiNodeDrag = (
  selectedNodeIds: string[],
  nodes: EnhancedNode[],
  onMoveNode: (id: string, x: number, y: number) => void
) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    initialPositions: new Map(),
  });

  const startDrag = useCallback((nodeId: string, clientX: number, clientY: number) => {
    const canvas = document.getElementById('canvas');
    const canvasRect = canvas?.getBoundingClientRect();
    
    if (!canvasRect) return;

    const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
    const scrollLeft = scrollContainer?.scrollLeft || 0;
    const scrollTop = scrollContainer?.scrollTop || 0;

    const canvasX = clientX - canvasRect.left + scrollLeft;
    const canvasY = clientY - canvasRect.top + scrollTop;

    const draggedNode = nodes.find(n => n.id === nodeId);
    if (!draggedNode) return;

    const dragOffset = {
      x: canvasX - draggedNode.x,
      y: canvasY - draggedNode.y,
    };

    const initialPositions = new Map();
    const nodesToDrag = selectedNodeIds.includes(nodeId) ? selectedNodeIds : [nodeId];
    
    nodesToDrag.forEach(id => {
      const node = nodes.find(n => n.id === id);
      if (node) {
        initialPositions.set(id, { x: node.x, y: node.y });
      }
    });

    setDragState({
      isDragging: true,
      dragOffset,
      initialPositions,
    });
  }, [selectedNodeIds, nodes]);

  const updateDrag = useCallback((clientX: number, clientY: number) => {
    if (!dragState.isDragging) return;

    const canvas = document.getElementById('canvas');
    const canvasRect = canvas?.getBoundingClientRect();
    
    if (!canvasRect) return;

    const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
    const scrollLeft = scrollContainer?.scrollLeft || 0;
    const scrollTop = scrollContainer?.scrollTop || 0;

    const canvasX = clientX - canvasRect.left + scrollLeft;
    const canvasY = clientY - canvasRect.top + scrollTop;

    const newX = canvasX - dragState.dragOffset.x;
    const newY = canvasY - dragState.dragOffset.y;

    // Calculate the movement delta
    const firstNodeId = dragState.initialPositions.keys().next().value;
    const firstNodeInitial = dragState.initialPositions.get(firstNodeId);
    
    if (firstNodeInitial) {
      const deltaX = newX - firstNodeInitial.x;
      const deltaY = newY - firstNodeInitial.y;

      // Move all selected nodes by the same delta
      dragState.initialPositions.forEach((initialPos, nodeId) => {
        const constrainedX = Math.max(0, Math.min(initialPos.x + deltaX, 2880)); // Canvas width - node width - scrollbar space
        const constrainedY = Math.max(0, Math.min(initialPos.y + deltaY, 2940)); // Canvas height - node height
        onMoveNode(nodeId, constrainedX, constrainedY);
      });
    }
  }, [dragState, onMoveNode]);

  const endDrag = useCallback(() => {
    setDragState({
      isDragging: false,
      dragOffset: { x: 0, y: 0 },
      initialPositions: new Map(),
    });
  }, []);

  return {
    isDragging: dragState.isDragging,
    startDrag,
    updateDrag,
    endDrag,
  };
};
