import { useState, useRef, useEffect } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { usePointerEvents } from './usePointerEvents';
import { DragState, PointerDragEvent } from '../types/nodeProps';

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

  const startDrag = (e: PointerDragEvent) => {
    if (e.defaultPrevented) {
      console.log("useNodeDrag: Event defaultPrevented, not starting single drag for node:", node.id);
      return;
    }
    console.log("useNodeDrag: Attempting to start single drag for node:", node.id);

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
      
      console.log(`useNodeDrag: Starting single drag for ${node.id} at canvasX: ${canvasX}, canvasY: ${canvasY}. Node pos: ${node.x}, ${node.y}`);
      setDragState({
        isDragging: true,
        dragOffset: {
          x: canvasX - node.x,
          y: canvasY - node.y
        }
      });
    } else {
      console.warn("useNodeDrag: Could not get rects for drag calculation for node:", node.id);
    }
  };

  useEffect(() => {
    if (!dragState.isDragging) return;
    console.log(`useNodeDrag: useEffect - Single drag active for ${node.id}`);

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
          3000 - (nodeRef.current?.offsetWidth || 120)
        ));
        const newY = Math.max(0, Math.min(
          canvasY - dragState.dragOffset.y,
          3000 - (nodeRef.current?.offsetHeight || 60)
        ));
        
        onMove(node.id, newX, newY);
      }
    };

    const handlePointerEnd = () => {
      console.log(`useNodeDrag: Ending single drag for ${node.id}`);
      setDragState(prev => ({ ...prev, isDragging: false }));
    };

    const cleanup = addPointerEventListeners(document.body, handlePointerMove, handlePointerEnd);
    return cleanup;
  }, [dragState.isDragging, dragState.dragOffset, node.id, onMove, addPointerEventListeners, nodeRef]);

  return {
    nodeRef,
    isDragging: dragState.isDragging,
    startDrag
  };
};
