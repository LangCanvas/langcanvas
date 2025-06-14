
import React, { useState, useRef, useCallback } from 'react';
import { EnhancedNode } from '../../types/nodeTypes';
import { usePointerEvents } from '../../hooks/usePointerEvents';
import { useRealTimeValidation } from '../../hooks/useRealTimeValidation';
import { getNodeEdgePoint, getNodeCenter } from '../../utils/edgeCalculations';
import SmartConnectionPreview from './SmartConnectionPreview';
import ConnectionConstraints from './ConnectionConstraints';

interface EdgePreview {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  targetNode?: EnhancedNode;
  isValid: boolean;
  errorMessage?: string;
}

interface EdgeCreationHandlerProps {
  nodes: EnhancedNode[];
  edges: any[];
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
  edges,
  onAddEdge,
  canvasRef,
  children
}) => {
  const [isCreatingEdge, setIsCreatingEdge] = useState(false);
  const [edgePreview, setEdgePreview] = useState<EdgePreview | null>(null);
  const [sourceNode, setSourceNode] = useState<EnhancedNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const { getPointerEvent, addPointerEventListeners } = usePointerEvents();
  const { validateConnectionAttempt, showValidationToast } = useRealTimeValidation({
    nodes,
    edges,
    enableRealTimeValidation: true
  });

  const handleStartConnection = useCallback((node: EnhancedNode, startX: number, startY: number) => {
    console.log(`🔗 Starting edge creation from ${node.label} at (${startX}, ${startY})`);
    setIsCreatingEdge(true);
    setSourceNode(node);
    setEdgePreview({
      startX,
      startY,
      endX: startX,
      endY: startY,
      isValid: true
    });
  }, []);

  const getCanvasCoordinates = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: clientX, y: clientY };
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
    const scrollLeft = scrollContainer?.scrollLeft || 0;
    const scrollTop = scrollContainer?.scrollTop || 0;
    
    return {
      x: clientX - rect.left + scrollLeft,
      y: clientY - rect.top + scrollTop
    };
  }, [canvasRef]);

  const handlePointerMove = useCallback((pointerEvent: any) => {
    if (!isCreatingEdge || !canvasRef.current || !sourceNode) return;

    const canvasCoords = getCanvasCoordinates(pointerEvent.clientX, pointerEvent.clientY);

    // Check if hovering over a node
    const nodeElement = document.elementFromPoint(pointerEvent.clientX, pointerEvent.clientY);
    const nodeContainer = nodeElement?.closest('[data-node-id]');
    const hoveredNodeId = nodeContainer?.getAttribute('data-node-id');
    const targetNode = hoveredNodeId ? nodes.find(node => node.id === hoveredNodeId) : null;
    
    if (targetNode && targetNode.id !== sourceNode.id) {
      setHoveredNodeId(targetNode.id);
      
      // Validate the connection attempt
      const validation = validateConnectionAttempt(sourceNode, targetNode);
      
      // Calculate edge-to-edge connection using canvas coordinates
      const targetCenter = getNodeCenter(targetNode);
      const sourceEdgePoint = getNodeEdgePoint(sourceNode, targetCenter.x, targetCenter.y);
      const targetEdgePoint = getNodeEdgePoint(targetNode, sourceEdgePoint.x, sourceEdgePoint.y);
      
      setEdgePreview({
        startX: sourceEdgePoint.x,
        startY: sourceEdgePoint.y,
        endX: targetEdgePoint.x,
        endY: targetEdgePoint.y,
        targetNode,
        isValid: validation.isValid,
        errorMessage: validation.errorMessage
      });
    } else {
      setHoveredNodeId(null);
      
      // Show edge from source to mouse cursor using canvas coordinates
      const sourceEdgePoint = getNodeEdgePoint(sourceNode, canvasCoords.x, canvasCoords.y);
      
      setEdgePreview({
        startX: sourceEdgePoint.x,
        startY: sourceEdgePoint.y,
        endX: canvasCoords.x,
        endY: canvasCoords.y,
        isValid: true
      });
    }
  }, [isCreatingEdge, sourceNode, nodes, getCanvasCoordinates, validateConnectionAttempt]);

  const handlePointerEnd = useCallback((pointerEvent: any) => {
    if (!isCreatingEdge || !sourceNode) return;

    // Find the target node
    const nodeElement = document.elementFromPoint(pointerEvent.clientX, pointerEvent.clientY);
    const nodeContainer = nodeElement?.closest('[data-node-id]');
    const targetNodeId = nodeContainer?.getAttribute('data-node-id');
    
    if (targetNodeId && targetNodeId !== sourceNode.id) {
      const targetNode = nodes.find(node => node.id === targetNodeId);
      if (targetNode) {
        // Validate before attempting to create
        const validation = validateConnectionAttempt(sourceNode, targetNode);
        
        if (validation.isValid) {
          console.log(`🔗 Completing edge: ${sourceNode.label} -> ${targetNode.label}`);
          const result = onAddEdge(sourceNode, targetNode);
          
          if (!result.success && result.error) {
            console.error('Edge creation failed:', result.error);
            showValidationToast('error', result.error);
          } else if (result.success) {
            console.log(`✅ Edge created successfully: ${sourceNode.label} -> ${targetNode.label}`);
            showValidationToast('success', 'Connection created successfully');
          }
        } else {
          showValidationToast('error', validation.errorMessage || 'Invalid connection');
        }
      }
    }

    // Reset state
    setIsCreatingEdge(false);
    setEdgePreview(null);
    setSourceNode(null);
    setHoveredNodeId(null);
  }, [isCreatingEdge, sourceNode, nodes, onAddEdge, validateConnectionAttempt, showValidationToast]);

  React.useEffect(() => {
    if (!isCreatingEdge) return;

    const cleanup = addPointerEventListeners(document.body, handlePointerMove, handlePointerEnd);
    return cleanup;
  }, [isCreatingEdge, handlePointerMove, handlePointerEnd, addPointerEventListeners]);

  return (
    <ConnectionConstraints sourceNode={sourceNode} nodes={nodes}>
      {(isValidTarget) => (
        <>
          {children({
            isCreatingEdge,
            edgePreview,
            hoveredNodeId,
            handleStartConnection
          })}
          
          {/* Render smart connection preview */}
          {edgePreview && (
            <div className="absolute inset-0 pointer-events-none z-20">
              <svg className="w-full h-full">
                <SmartConnectionPreview
                  sourceNode={sourceNode}
                  targetNode={edgePreview.targetNode}
                  startX={edgePreview.startX}
                  startY={edgePreview.startY}
                  endX={edgePreview.endX}
                  endY={edgePreview.endY}
                  isValid={edgePreview.isValid}
                  errorMessage={edgePreview.errorMessage}
                />
              </svg>
            </div>
          )}
        </>
      )}
    </ConnectionConstraints>
  );
};

export default EdgeCreationHandler;
