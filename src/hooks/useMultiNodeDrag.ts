
import { useState, useCallback, useRef } from 'react';
import { EnhancedNode } from '../types/nodeTypes';

export const useMultiNodeDrag = (
  selectedNodeIds: string[],
  nodes: EnhancedNode[],
  onMoveNode: (id: string, x: number, y: number) => void
) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef<{
    startPositions: Map<string, { x: number; y: number }>;
    startClientX: number;
    startClientY: number;
    dragOffsets: Map<string, { x: number; y: number }>;
  } | null>(null);

  const startDrag = useCallback((
    initiatingNodeId: string,
    clientX: number,
    clientY: number
  ) => {
    if (selectedNodeIds.length === 0) return;

    console.log(`🎯 Starting multi-node drag with ${selectedNodeIds.length} nodes`);

    const canvas = document.getElementById('canvas');
    const canvasRect = canvas?.getBoundingClientRect();
    const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
    
    if (!canvasRect || !scrollContainer) return;

    const scrollLeft = scrollContainer.scrollLeft || 0;
    const scrollTop = scrollContainer.scrollTop || 0;
    const canvasX = clientX - canvasRect.left + scrollLeft;
    const canvasY = clientY - canvasRect.top + scrollTop;

    // Store initial positions and calculate offsets
    const startPositions = new Map<string, { x: number; y: number }>();
    const dragOffsets = new Map<string, { x: number; y: number }>();

    selectedNodeIds.forEach(nodeId => {
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        startPositions.set(nodeId, { x: node.x, y: node.y });
        dragOffsets.set(nodeId, {
          x: canvasX - node.x,
          y: canvasY - node.y
        });
      }
    });

    dragStateRef.current = {
      startPositions,
      startClientX: clientX,
      startClientY: clientY,
      dragOffsets
    };

    setIsDragging(true);

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStateRef.current) return;

      const canvas = document.getElementById('canvas');
      const canvasRect = canvas?.getBoundingClientRect();
      const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
      
      if (!canvasRect || !scrollContainer) return;

      const scrollLeft = scrollContainer.scrollLeft || 0;
      const scrollTop = scrollContainer.scrollTop || 0;
      const currentCanvasX = e.clientX - canvasRect.left + scrollLeft;
      const currentCanvasY = e.clientY - canvasRect.top + scrollTop;

      // Update all selected nodes
      selectedNodeIds.forEach(nodeId => {
        const startPos = dragStateRef.current!.startPositions.get(nodeId);
        const offset = dragStateRef.current!.dragOffsets.get(nodeId);
        
        if (startPos && offset) {
          const newX = Math.max(0, Math.min(
            currentCanvasX - offset.x,
            3000 - 120 // Canvas width minus approximate node width
          ));
          const newY = Math.max(0, Math.min(
            currentCanvasY - offset.y,
            3000 - 60 // Canvas height minus approximate node height
          ));
          
          onMoveNode(nodeId, newX, newY);
        }
      });
    };

    const handleMouseUp = () => {
      console.log(`🎯 Ending multi-node drag`);
      setIsDragging(false);
      dragStateRef.current = null;
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [selectedNodeIds, nodes, onMoveNode]);

  return {
    isDragging,
    startDrag
  };
};
