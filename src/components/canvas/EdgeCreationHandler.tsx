
import React, { useState } from 'react';
import { Node as NodeData } from '../../hooks/useNodes';
import { usePointerEvents } from '../../hooks/usePointerEvents';
import { useToast } from '@/hooks/use-toast';

interface EdgeCreationHandlerProps {
  nodes: NodeData[];
  onAddEdge: (sourceNode: NodeData, targetNode: NodeData) => { success: boolean; error?: string };
  canvasRef: React.RefObject<HTMLDivElement>;
  children: (props: {
    isCreatingEdge: boolean;
    edgePreview: { startX: number; startY: number; endX: number; endY: number; sourceNode: NodeData } | null;
    hoveredNodeId: string | null;
    handleStartConnection: (sourceNode: NodeData, startX: number, startY: number) => void;
  }) => React.ReactNode;
}

const EdgeCreationHandler: React.FC<EdgeCreationHandlerProps> = ({ 
  nodes, 
  onAddEdge, 
  canvasRef, 
  children 
}) => {
  const [isCreatingEdge, setIsCreatingEdge] = useState(false);
  const [edgePreview, setEdgePreview] = useState<{ startX: number; startY: number; endX: number; endY: number; sourceNode: NodeData } | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const { toast } = useToast();
  const { addPointerEventListeners } = usePointerEvents();

  const handleStartConnection = (sourceNode: NodeData, startX: number, startY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    const relativeStartX = startX - canvasRect.left;
    const relativeStartY = startY - canvasRect.top;

    setIsCreatingEdge(true);
    setEdgePreview({
      startX: relativeStartX,
      startY: relativeStartY,
      endX: relativeStartX,
      endY: relativeStartY,
      sourceNode
    });

    const handlePointerMove = (pointerEvent: any) => {
      const newEndX = pointerEvent.clientX - canvasRect.left;
      const newEndY = pointerEvent.clientY - canvasRect.top;
      
      setEdgePreview(prev => prev ? {
        ...prev,
        endX: newEndX,
        endY: newEndY
      } : null);

      // Check if hovering over a node
      const elementUnderCursor = document.elementFromPoint(pointerEvent.clientX, pointerEvent.clientY);
      const nodeElement = elementUnderCursor?.closest('[data-node-id]') as HTMLElement;
      
      if (nodeElement) {
        const nodeId = nodeElement.getAttribute('data-node-id');
        setHoveredNodeId(nodeId);
      } else {
        setHoveredNodeId(null);
      }
    };

    const handlePointerEnd = (pointerEvent: any) => {
      const elementUnderCursor = document.elementFromPoint(pointerEvent.clientX, pointerEvent.clientY);
      const nodeElement = elementUnderCursor?.closest('[data-node-id]') as HTMLElement;
      
      if (nodeElement) {
        const targetNodeId = nodeElement.getAttribute('data-node-id');
        const targetNode = nodes.find(n => n.id === targetNodeId);
        
        if (targetNode && targetNode.id !== sourceNode.id) {
          const result = onAddEdge(sourceNode, targetNode);
          if (!result.success && result.error) {
            toast({
              title: "Connection Failed",
              description: result.error,
              variant: "destructive",
            });
          }
        }
      }

      // Cleanup
      setIsCreatingEdge(false);
      setEdgePreview(null);
      setHoveredNodeId(null);
    };

    const cleanup = addPointerEventListeners(document.body, handlePointerMove, handlePointerEnd);
    
    // Auto-cleanup after a timeout for touch devices
    const timeout = setTimeout(() => {
      if (isCreatingEdge) {
        setIsCreatingEdge(false);
        setEdgePreview(null);
        setHoveredNodeId(null);
        cleanup();
      }
    }, 10000);

    // Return cleanup function that also clears timeout
    return () => {
      cleanup();
      clearTimeout(timeout);
    };
  };

  return (
    <>
      {children({
        isCreatingEdge,
        edgePreview,
        hoveredNodeId,
        handleStartConnection
      })}
    </>
  );
};

export default EdgeCreationHandler;
