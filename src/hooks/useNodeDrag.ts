
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
    if (!dragStateRef.current) {
      console.log(`useNodeDrag(${node.id}): No drag state in move handler`);
      return;
    }

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
        
        console.log(`useNodeDrag(${node.id}): Moving to ${newX}, ${newY}`);
        onMove(node.id, newX, newY);
      }
    } else {
      const dx = e.clientX - dragStateRef.current.startX;
      const dy = e.clientY - dragStateRef.current.startY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > DRAG_THRESHOLD) {
        console.log(`useNodeDrag(${node.id}): Threshold exceeded (${distance}px), starting drag`);
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
          console.log(`useNodeDrag(${node.id}): Set drag offset:`, dragStateRef.current.dragOffset);
        }
      }
    }
  }, [node.id, node.x, node.y, onMove]);
  
  const handlePointerUp = useCallback(() => {
    console.log(`useNodeDrag(${node.id}): Pointer up - cleaning up listeners`);
    
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
    
    if (isDraggingRef.current) {
      console.log(`useNodeDrag(${node.id}): Ending single drag`);
      isDraggingRef.current = false;
      setVisualDragging(false);
    }
    dragStateRef.current = null;
  }, [handlePointerMove, node.id]);

  const startDrag = useCallback((e: PointerDragEvent) => {
    if (e.defaultPrevented) {
      console.log(`useNodeDrag(${node.id}): Event defaultPrevented, not starting drag`);
      return;
    }
    
    console.log(`useNodeDrag(${node.id}): Starting single-node drag (isSelected: ${isSelected})`);
    
    e.stopPropagation();

    dragStateRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      dragOffset: { x: 0, y: 0 }
    };
    
    console.log(`useNodeDrag(${node.id}): Adding event listeners for single drag`);
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  }, [handlePointerMove, handlePointerUp, isSelected, node.id]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      console.log(`useNodeDrag(${node.id}): Cleanup - removing event listeners`);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp, node.id]);

  return {
    nodeRef,
    isDragging: isVisualDragging,
    startDrag
  };
};
