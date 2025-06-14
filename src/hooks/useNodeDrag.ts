
import { useState, useRef, useEffect, useCallback } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { PointerDragEvent } from '../types/nodeProps';

const DRAG_THRESHOLD = 5; // pixels

export const useNodeDrag = (
  node: EnhancedNode,
  onMove: (id: string, x: number, y: number) => void,
  isSelected: boolean
) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStateRef = useRef<{
    startX: number;
    startY: number;
    dragOffset: { x: number; y: number };
  } | null>(null);

  const [isVisualDragging, setVisualDragging] = useState(false);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!dragStateRef.current) return;

    if (isDraggingRef.current) {
      const canvas = document.getElementById('canvas');
      const canvasRect = canvas?.getBoundingClientRect();
      const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
      
      if (canvasRect && scrollContainer) {
        const scrollLeft = scrollContainer.scrollLeft || 0;
        const scrollTop = scrollContainer.scrollTop || 0;
        
        const canvasX = e.clientX - canvasRect.left + scrollLeft;
        const canvasY = e.clientY - canvasRect.top + scrollTop;
        
        const newX = Math.max(0, Math.min(
          canvasX - dragStateRef.current.dragOffset.x,
          3000 - (nodeRef.current?.offsetWidth || 120)
        ));
        const newY = Math.max(0, Math.min(
          canvasY - dragStateRef.current.dragOffset.y,
          3000 - (nodeRef.current?.offsetHeight || 60)
        ));
        
        onMove(node.id, newX, newY);
      }
    } else {
      const dx = e.clientX - dragStateRef.current.startX;
      const dy = e.clientY - dragStateRef.current.startY;
      if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
        isDraggingRef.current = true;
        setVisualDragging(true);

        const canvas = document.getElementById('canvas');
        const canvasRect = canvas?.getBoundingClientRect();
        const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
        if (canvasRect && scrollContainer) {
            const scrollLeft = scrollContainer.scrollLeft || 0;
            const scrollTop = scrollContainer.scrollTop || 0;
            const canvasX = e.clientX - canvasRect.left + scrollLeft;
            const canvasY = e.clientY - canvasRect.top + scrollTop;
            
            dragStateRef.current.dragOffset = {
                x: canvasX - node.x,
                y: canvasY - node.y
            };
            console.log(`useNodeDrag: Starting single drag for ${node.id}`);
        }
      }
    }
  }, [node.id, node.x, node.y, onMove]);
  
  const handlePointerUp = useCallback(() => {
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
    
    if (isDraggingRef.current) {
        console.log(`useNodeDrag: Ending single drag for ${node.id}`);
        isDraggingRef.current = false;
        setVisualDragging(false);
    }
    dragStateRef.current = null;
  }, [handlePointerMove]);

  const startDrag = useCallback((e: PointerDragEvent) => {
    // New Guard: If the node is already selected, do nothing.
    // The multi-drag handler is now responsible for all selected nodes.
    if (isSelected) {
      return;
    }

    if (e.defaultPrevented) {
      console.log("useNodeDrag: Event defaultPrevented, not starting single drag for node:", node.id);
      return;
    }
    console.log("useNodeDrag: Preparing to drag UNSELECTED node:", node.id);
    
    e.stopPropagation();

    dragStateRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      dragOffset: { x: 0, y: 0 }
    };
    
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  }, [handlePointerMove, handlePointerUp, isSelected, node.id]);

  useEffect(() => {
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  return {
    nodeRef,
    isDragging: isVisualDragging,
    startDrag
  };
};
