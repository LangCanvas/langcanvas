
import React, { useState, useRef, useEffect } from 'react';
import { Node } from '../hooks/useNodes';

interface ConnectionHandleProps {
  node: Node;
  canCreateEdge: boolean;
  onStartConnection: (sourceNode: Node, startX: number, startY: number) => void;
}

const ConnectionHandle: React.FC<ConnectionHandleProps> = ({ node, canCreateEdge, onStartConnection }) => {
  const [isHovered, setIsHovered] = useState(false);
  const handleRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canCreateEdge) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = handleRef.current?.getBoundingClientRect();
    if (rect) {
      onStartConnection(node, rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
  };

  // Don't show handle for end nodes (no outgoing connections)
  if (node.type === 'end') return null;

  // Position handle on the right side of the node
  const handleStyle = {
    position: 'absolute' as const,
    right: '-6px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: canCreateEdge ? (isHovered ? '#3b82f6' : '#9ca3af') : '#d1d5db',
    border: '2px solid white',
    cursor: canCreateEdge ? 'crosshair' : 'not-allowed',
    zIndex: 20,
    opacity: canCreateEdge ? 1 : 0.5,
    transition: 'all 0.2s ease'
  };

  return (
    <div
      ref={handleRef}
      style={handleStyle}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={canCreateEdge ? "Drag to connect" : "Cannot create more connections"}
    />
  );
};

export default ConnectionHandle;
