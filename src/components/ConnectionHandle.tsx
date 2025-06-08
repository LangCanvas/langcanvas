
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
    // Calculate the right edge position for the connection handle using canvas coordinates
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
    
    // Calculate the edge position of the source node in canvas coordinates
    const edgePosition = getNodeEdgePosition(node);
    console.log(`🔗 Starting connection from ${node.label} at canvas coords (${edgePosition.x}, ${edgePosition.y})`);
    onStartConnection(node, edgePosition.x, edgePosition.y);
  };

  // Don't show handle for end nodes (no outgoing connections)
  if (node.type === 'end') return null;

  // Special positioning for diamond-shaped conditional nodes
  const handleStyle = node.type === 'conditional' ? {
    position: 'absolute' as const,
    right: '-28px', // Moved further out to be visible outside the diamond clip
    top: '50%',
    transform: 'translateY(-50%)',
    width: '20px', // Slightly larger for better visibility
    height: '20px',
    borderRadius: '50%',
    backgroundColor: canCreateEdge ? (isHovered ? '#3b82f6' : '#10b981') : '#d1d5db',
    border: '3px solid white',
    cursor: canCreateEdge ? 'crosshair' : 'not-allowed',
    zIndex: 30, // Higher z-index to ensure visibility
    opacity: canCreateEdge ? 1 : 0.5,
    transition: 'all 0.2s ease',
    touchAction: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)', // Enhanced shadow for better visibility
  } : {
    position: 'absolute' as const,
    right: '-9px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: canCreateEdge ? (isHovered ? '#3b82f6' : '#10b981') : '#d1d5db',
    border: '3px solid white',
    cursor: canCreateEdge ? 'crosshair' : 'not-allowed',
    zIndex: 20,
    opacity: canCreateEdge ? 1 : 0.5,
    transition: 'all 0.2s ease',
    touchAction: 'none',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
