
import React, { useState, useRef } from 'react';
import { EnhancedNode } from '../../types/nodeTypes';
import { usePointerEvents } from '../../hooks/usePointerEvents';

interface RightConnectionHandleProps {
  node: EnhancedNode;
  canCreateEdge: boolean;
  onStartConnection: (sourceNode: EnhancedNode, startX: number, startY: number) => void;
  isVisible?: boolean;
}

const RightConnectionHandle: React.FC<RightConnectionHandleProps> = ({ 
  node, 
  canCreateEdge, 
  onStartConnection,
  isVisible = true 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const handleRef = useRef<HTMLDivElement>(null);
  const { getPointerEvent } = usePointerEvents();

  if (!isVisible || node.type === 'end') return null;

  const getRightConnectionPosition = (node: EnhancedNode) => {
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
    // Aggressively stop all event propagation to prevent node drag/selection
    pointerEvent.preventDefault();
    pointerEvent.stopPropagation();
    
    const edgePosition = getRightConnectionPosition(node);
    onStartConnection(node, edgePosition.x, edgePosition.y);
  };

  // Prevent any parent events from triggering
  const handlePointerUp = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
  };

  const handleStyle = node.type === 'conditional' ? {
    position: 'absolute' as const,
    right: '-12px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: canCreateEdge ? (isHovered ? '#3b82f6' : '#10b981') : '#d1d5db',
    border: '3px solid white',
    cursor: canCreateEdge ? 'crosshair' : 'not-allowed',
    zIndex: 50,
    opacity: canCreateEdge ? 1 : 0.5,
    transition: 'all 0.2s ease',
    touchAction: 'none',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
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
      onMouseUp={handlePointerUp}
      onTouchEnd={handlePointerUp}
      onMouseMove={handlePointerMove}
      onTouchMove={handlePointerMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={canCreateEdge ? "Drag to connect" : "Cannot create more connections"}
      data-handle="right"
      data-node-id={node.id}
    />
  );
};

export default RightConnectionHandle;
