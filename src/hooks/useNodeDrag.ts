
import { useState, useRef, useEffect } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { usePointerEvents } from './usePointerEvents';
import { DragState } from '../types/nodeProps';

export const useNodeDrag = (
  node: EnhancedNode,
  onMove: (id: string, x: number, y: number) => void
) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragOffset: { x: 0, y: 0 }
  });
  const nodeRef = useRef<HTMLDivElement>(null);
  const { getPointerEvent, addPointerEventListeners } = usePointerEvents();

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    const pointerEvent = getPointerEvent(e);
    pointerEvent.preventDefault();
    
    const rect = nodeRef.current?.getBoundingClientRect();
    const canvas = document.getElementById('canvas');
    const canvasRect = canvas?.getBoundingClientRect();
    const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
    
    if (rect && canvasRect && scrollContainer) {
      const scrollLeft = scrollContainer.scrollLeft || 0;
      const scrollTop = scrollContainer.scrollTop || 0;
      
      const canvasX = pointerEvent.clientX - canvasRect.left + scrollLeft;
      const canvasY = pointerEvent.clientY - canvasRect.top + scrollTop;
      
      setDragState({
        isDragging: true,
        dragOffset: {
          x: canvasX - node.x,
          y: canvasY - node.y
        }
      });
    }
  };

  useEffect(() => {
    if (!dragState.isDragging) return;

    const handlePointerMove = (pointerEvent: any) => {
      const canvas = document.getElementById('canvas');
      const canvasRect = canvas?.getBoundingClientRect();
      const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
      
      if (canvasRect && scrollContainer) {
        const scrollLeft = scrollContainer.scrollLeft || 0;
        const scrollTop = scrollContainer.scrollTop || 0;
        
        const canvasX = pointerEvent.clientX - canvasRect.left + scrollLeft;
        const canvasY = pointerEvent.clientY - canvasRect.top + scrollTop;
        
        const newX = Math.max(0, Math.min(
          canvasX - dragState.dragOffset.x,
          3000 - 120
        ));
        const newY = Math.max(0, Math.min(
          canvasY - dragState.dragOffset.y,
          3000 - 60
        ));
        
        onMove(node.id, newX, newY);
      }
    };

    const handlePointerEnd = () => {
      setDragState(prev => ({ ...prev, isDragging: false }));
    };

    const cleanup = addPointerEventListeners(document.body, handlePointerMove, handlePointerEnd);
    return cleanup;
  }, [dragState.isDragging, dragState.dragOffset, node.id, onMove, addPointerEventListeners]);

  return {
    nodeRef,
    isDragging: dragState.isDragging,
    startDrag
  };
};
