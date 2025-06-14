
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

  // Use refs for stable references
  const nodeDataRef = useRef(node);
  const onMoveRef = useRef(onMove);
  const isSelectedRef = useRef(isSelected);

  // Update refs when props change
  nodeDataRef.current = node;
  onMoveRef.current = onMove;
  isSelectedRef.current = isSelected;

  // Stable event handlers using refs
  const handlePointerMoveRef = useRef<(e: PointerEvent) => void>();
  const handlePointerUpRef = useRef<() => void>();

  if (!handlePointerMoveRef.current) {
    handlePointerMoveRef.current = (e: PointerEvent) => {
      if (!dragStateRef.current) {
        console.log(`useNodeDrag(${nodeDataRef.current.id}): No drag state in move handler`);
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
          
          console.log(`useNodeDrag(${nodeDataRef.current.id}): Moving to ${newX}, ${newY}`);
          onMoveRef.current(nodeDataRef.current.id, newX, newY);
        }
      } else {
        const dx = e.clientX - dragStateRef.current.startX;
        const dy = e.clientY - dragStateRef.current.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > DRAG_THRESHOLD) {
          console.log(`useNodeDrag(${nodeDataRef.current.id}): Threshold exceeded (${distance}px), starting drag`);
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
              x: canvasX - nodeDataRef.current.x,
              y: canvasY - nodeDataRef.current.y
            };
            console.log(`useNodeDrag(${nodeDataRef.current.id}): Set drag offset:`, dragStateRef.current.dragOffset);
          }
        }
      }
    };
  }
  
  if (!handlePointerUpRef.current) {
    handlePointerUpRef.current = () => {
      console.log(`useNodeDrag(${nodeDataRef.current.id}): Pointer up - cleaning up listeners`);
      
      if (handlePointerMoveRef.current && handlePointerUpRef.current) {
        document.removeEventListener('pointermove', handlePointerMoveRef.current);
        document.removeEventListener('pointerup', handlePointerUpRef.current);
      }
      
      if (isDraggingRef.current) {
        console.log(`useNodeDrag(${nodeDataRef.current.id}): Ending single drag`);
        isDraggingRef.current = false;
        setVisualDragging(false);
      }
      dragStateRef.current = null;
    };
  }

  const startDrag = useCallback((e: PointerDragEvent) => {
    if (e.defaultPrevented) {
      console.log(`useNodeDrag(${nodeDataRef.current.id}): Event defaultPrevented, not starting drag`);
      return;
    }
    
    console.log(`useNodeDrag(${nodeDataRef.current.id}): Starting single-node drag (isSelected: ${isSelectedRef.current})`);
    
    e.stopPropagation();

    dragStateRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      dragOffset: { x: 0, y: 0 }
    };
    
    console.log(`useNodeDrag(${nodeDataRef.current.id}): Adding event listeners for single drag`);
    if (handlePointerMoveRef.current && handlePointerUpRef.current) {
      document.addEventListener('pointermove', handlePointerMoveRef.current);
      document.addEventListener('pointerup', handlePointerUpRef.current);
    }
  }, []); // No dependencies to prevent re-creation

  // Cleanup effect with no dependencies to prevent premature cleanup
  useEffect(() => {
    return () => {
      // Only cleanup if we're not actively dragging
      if (!isDraggingRef.current) {
        console.log(`useNodeDrag(${nodeDataRef.current.id}): Component cleanup - removing event listeners`);
        if (handlePointerMoveRef.current && handlePointerUpRef.current) {
          document.removeEventListener('pointermove', handlePointerMoveRef.current);
          document.removeEventListener('pointerup', handlePointerUpRef.current);
        }
      }
    };
  }, []); // No dependencies to prevent cleanup during drag

  return {
    nodeRef,
    isDragging: isVisualDragging,
    startDrag
  };
};
