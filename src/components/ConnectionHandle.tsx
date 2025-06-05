
import React, { useState, useRef } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { usePointerEvents } from '../hooks/usePointerEvents';

interface ConnectionHandleProps {
  node: EnhancedNode;
  canCreateEdge: boolean;
  onStartConnection: (sourceNode: EnhancedNode, startX: number, startY: number) => void;
}

const ConnectionHandle: React.FC<ConnectionHandleProps> = ({ node, canCreateEdge, onStartConnection }) => {
  const [isHovered, setIsHovered] = useState(false);
  const handleRef = useRef<HTMLDivElement>(null);
  const { getPointerEvent } = usePointerEvents();

  const getNodeEdgePosition = (node: EnhancedNode) => {
    // Calculate the right edge position for the connection handle
    const nodeWidth = node.type === 'conditional' ? 80 : 120;
    const nodeHeight = node.type === 'conditional' ? 80 : 60;
    
    return {
      x: node.x + nodeWidth,
      y: node.y + nodeHeight / 2
    };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canCreateEdge) return;
    
    const pointerEvent = getPointerEvent(e);
    pointerEvent.preventDefault();
    pointerEvent.stopPropagation();
    
    // Calculate the edge position of the source node
    const edgePosition = getNodeEdgePosition(node);
    onStartConnection(node, edgePosition.x, edgePosition.y);
  };

  // Don't show handle for end nodes (no outgoing connections)
  if (node.type === 'end') return null;

  // Special positioning for diamond-shaped conditional nodes
  const handleStyle = node.type === 'conditional' ? {
    position: 'absolute' as const,
    right: '-20px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: canCreateEdge ? (isHovered ? '#3b82f6' : '#9ca3af') : '#d1d5db',
    border: '2px solid white',
    cursor: canCreateEdge ? 'crosshair' : 'not-allowed',
    zIndex: 20,
    opacity: canCreateEdge ? 1 : 0.5,
    transition: 'all 0.2s ease',
    touchAction: 'none',
  } : {
    position: 'absolute' as const,
    right: '-8px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: canCreateEdge ? (isHovered ? '#3b82f6' : '#9ca3af') : '#d1d5db',
    border: '2px solid white',
    cursor: canCreateEdge ? 'crosshair' : 'not-allowed',
    zIndex: 20,
    opacity: canCreateEdge ? 1 : 0.5,
    transition: 'all 0.2s ease',
    touchAction: 'none',
  };

  return (
    <div
      ref={handleRef}
      style={handleStyle}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={canCreateEdge ? "Drag to connect" : "Cannot create more connections"}
    />
  );
};

export default ConnectionHandle;
