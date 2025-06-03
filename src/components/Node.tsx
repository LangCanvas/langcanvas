
import React, { useState, useRef } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { usePointerEvents } from '../hooks/usePointerEvents';
import ConnectionHandle from './ConnectionHandle';

interface NodeComponentProps {
  node: EnhancedNode;
  isSelected: boolean;
  canCreateEdge: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onStartConnection: (sourceNode: EnhancedNode, startX: number, startY: number) => void;
  validationClass?: string;
  validationTooltip?: string;
}

const NodeComponent: React.FC<NodeComponentProps> = ({ 
  node, 
  isSelected, 
  canCreateEdge, 
  onSelect, 
  onMove, 
  onStartConnection,
  validationClass = '',
  validationTooltip = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);
  const { getPointerEvent, addPointerEventListeners } = usePointerEvents();

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pointerEvent = getPointerEvent(e);
    pointerEvent.preventDefault();
    onSelect(node.id);
    
    const rect = nodeRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: pointerEvent.clientX - rect.left,
        y: pointerEvent.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  React.useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (pointerEvent: any) => {
      const canvas = document.getElementById('canvas');
      const canvasRect = canvas?.getBoundingClientRect();
      
      if (canvasRect) {
        const newX = Math.max(0, Math.min(
          pointerEvent.clientX - canvasRect.left - dragOffset.x,
          canvasRect.width - 120 // Node width
        ));
        const newY = Math.max(0, Math.min(
          pointerEvent.clientY - canvasRect.top - dragOffset.y,
          canvasRect.height - 60 // Node height
        ));
        
        onMove(node.id, newX, newY);
      }
    };

    const handlePointerEnd = () => {
      setIsDragging(false);
    };

    const cleanup = addPointerEventListeners(document.body, handlePointerMove, handlePointerEnd);
    return cleanup;
  }, [isDragging, dragOffset, node.id, onMove, addPointerEventListeners]);

  const getNodeStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      left: node.x,
      top: node.y,
      width: '120px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      border: '2px solid',
      cursor: isDragging ? 'grabbing' : 'grab',
      userSelect: 'none' as const,
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.1)',
      zIndex: isSelected ? 10 : 5,
      touchAction: 'none', // Prevent default touch behaviors
    };

    switch (node.type) {
      case 'agent':
        return {
          ...baseStyle,
          backgroundColor: '#f0fdf4',
          borderColor: isSelected ? '#16a34a' : '#22c55e',
          color: '#15803d',
          borderRadius: '30px',
        };
      case 'tool':
        return {
          ...baseStyle,
          backgroundColor: '#eff6ff',
          borderColor: isSelected ? '#2563eb' : '#3b82f6',
          color: '#1d4ed8',
        };
      case 'function':
        return {
          ...baseStyle,
          backgroundColor: '#faf5ff',
          borderColor: isSelected ? '#9333ea' : '#a855f7',
          color: '#7c3aed',
        };
      case 'conditional':
        return {
          ...baseStyle,
          backgroundColor: '#fff7ed',
          borderColor: isSelected ? '#ea580c' : '#f97316',
          color: '#c2410c',
          transform: 'rotate(45deg)',
          fontSize: '12px',
        };
      case 'parallel':
        return {
          ...baseStyle,
          backgroundColor: '#ecfeff',
          borderColor: isSelected ? '#0891b2' : '#06b6d4',
          color: '#0e7490',
        };
      case 'end':
        return {
          ...baseStyle,
          backgroundColor: '#fef2f2',
          borderColor: isSelected ? '#dc2626' : '#ef4444',
          color: '#b91c1c',
          borderRadius: '30px',
        };
      default:
        return baseStyle;
    }
  };

  // Combine validation tooltip with any existing title
  const tooltipText = validationTooltip || undefined;

  return (
    <div
      ref={nodeRef}
      style={getNodeStyle()}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
      className={`node ${node.type}-node ${isSelected ? 'selected' : ''} ${validationClass}`}
      data-node-id={node.id}
      data-node-type={node.type}
      title={tooltipText}
    >
      <span style={{ transform: node.type === 'conditional' ? 'rotate(-45deg)' : 'none' }}>
        {node.label}
      </span>
      
      {/* Connection Handle */}
      <ConnectionHandle
        node={node}
        canCreateEdge={canCreateEdge}
        onStartConnection={onStartConnection}
      />
    </div>
  );
};

export default NodeComponent;
