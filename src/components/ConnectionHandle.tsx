
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

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canCreateEdge) return;
    
    const pointerEvent = getPointerEvent(e);
    pointerEvent.preventDefault();
    pointerEvent.stopPropagation();
    
    const rect = handleRef.current?.getBoundingClientRect();
    if (rect) {
      onStartConnection(node, rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
  };

  // Don't show handle for end nodes (no outgoing connections)
  if (node.type === 'end') return null;

  // Position handle on the right side of the node with larger touch target
  const handleStyle = {
    position: 'absolute' as const,
    right: '-8px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '16px', // Larger for better touch target
    height: '16px', // Larger for better touch target
    borderRadius: '50%',
    backgroundColor: canCreateEdge ? (isHovered ? '#3b82f6' : '#9ca3af') : '#d1d5db',
    border: '2px solid white',
    cursor: canCreateEdge ? 'crosshair' : 'not-allowed',
    zIndex: 20,
    opacity: canCreateEdge ? 1 : 0.5,
    transition: 'all 0.2s ease',
    touchAction: 'none', // Prevent default touch behaviors
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
