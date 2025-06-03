
import React, { useState, useRef, useCallback } from 'react';
import { EnhancedNode } from '../../types/nodeTypes';
import { usePointerEvents } from '../../hooks/usePointerEvents';

interface EdgePreview {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface EdgeCreationHandlerProps {
  nodes: EnhancedNode[];
  onAddEdge: (sourceNode: EnhancedNode, targetNode: EnhancedNode) => { success: boolean; error?: string };
  canvasRef: React.RefObject<HTMLDivElement>;
  children: (props: {
    isCreatingEdge: boolean;
    edgePreview: EdgePreview | null;
    hoveredNodeId: string | null;
    handleStartConnection: (sourceNode: EnhancedNode, startX: number, startY: number) => void;
  }) => React.ReactNode;
}

const EdgeCreationHandler: React.FC<EdgeCreationHandlerProps> = ({
  nodes,
  onAddEdge,
  canvasRef,
  children
}) => {
  const [isCreatingEdge, setIsCreatingEdge] = useState(false);
  const [edgePreview, setEdgePreview] = useState<EdgePreview | null>(null);
  const [sourceNode, setSourceNode] = useState<EnhancedNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const { getPointerEvent, addPointerEventListeners } = usePointerEvents();

  const handleStartConnection = useCallback((node: EnhancedNode, startX: number, startY: number) => {
    console.log(`🔗 Starting edge creation from ${node.label}`);
    setIsCreatingEdge(true);
    setSourceNode(node);
    setEdgePreview({
      startX,
      startY,
      endX: startX,
      endY: startY
    });
  }, []);

  const handlePointerMove = useCallback((pointerEvent: any) => {
    if (!isCreatingEdge || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = pointerEvent.clientX - rect.left;
    const y = pointerEvent.clientY - rect.top;

    setEdgePreview(prev => prev ? { ...prev, endX: x, endY: y } : null);

    // Check if hovering over a node
    const nodeElement = document.elementFromPoint(pointerEvent.clientX, pointerEvent.clientY);
    const nodeContainer = nodeElement?.closest('[data-node-id]');
    const nodeId = nodeContainer?.getAttribute('data-node-id');
    
    if (nodeId && nodeId !== sourceNode?.id) {
      setHoveredNodeId(nodeId);
    } else {
      setHoveredNodeId(null);
    }
  }, [isCreatingEdge, sourceNode?.id, canvasRef]);

  const handlePointerEnd = useCallback((pointerEvent: any) => {
    if (!isCreatingEdge || !sourceNode) return;

    // Find the target node
    const nodeElement = document.elementFromPoint(pointerEvent.clientX, pointerEvent.clientY);
    const nodeContainer = nodeElement?.closest('[data-node-id]');
    const targetNodeId = nodeContainer?.getAttribute('data-node-id');
    
    if (targetNodeId && targetNodeId !== sourceNode.id) {
      const targetNode = nodes.find(node => node.id === targetNodeId);
      if (targetNode) {
        console.log(`🔗 Completing edge: ${sourceNode.label} -> ${targetNode.label}`);
        const result = onAddEdge(sourceNode, targetNode);
        if (!result.success && result.error) {
          console.error('Edge creation failed:', result.error);
        }
      }
    }

    // Reset state
    setIsCreatingEdge(false);
    setEdgePreview(null);
    setSourceNode(null);
    setHoveredNodeId(null);
  }, [isCreatingEdge, sourceNode, nodes, onAddEdge]);

  React.useEffect(() => {
    if (!isCreatingEdge) return;

    const cleanup = addPointerEventListeners(document.body, handlePointerMove, handlePointerEnd);
    return cleanup;
  }, [isCreatingEdge, handlePointerMove, handlePointerEnd, addPointerEventListeners]);

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
