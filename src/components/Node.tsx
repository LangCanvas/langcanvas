
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
      const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
      
      if (canvasRect && scrollContainer) {
        const scrollLeft = scrollContainer.scrollLeft || 0;
        const scrollTop = scrollContainer.scrollTop || 0;
        
        const newX = Math.max(0, Math.min(
          pointerEvent.clientX - canvasRect.left - dragOffset.x + scrollLeft,
          3000 - 120 // Canvas width minus node width
        ));
        const newY = Math.max(0, Math.min(
          pointerEvent.clientY - canvasRect.top - dragOffset.y + scrollTop,
          3000 - 60 // Canvas height minus node height
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
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: isDragging ? 'grabbing' : 'grab',
      userSelect: 'none' as const,
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.1)',
      zIndex: isSelected ? 10 : 5,
      touchAction: 'none', // Prevent default touch behaviors
    };

    // Special handling for conditional node (diamond shape)
    if (node.type === 'conditional') {
      return {
        ...baseStyle,
        width: '80px',
        height: '80px',
        backgroundColor: '#fff7ed',
        border: `2px solid ${isSelected ? '#ea580c' : '#f97316'}`,
        color: '#c2410c',
        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
        fontSize: '12px',
      };
    }

    // Regular node styles
    const regularStyle = {
      ...baseStyle,
      width: '120px',
      height: '60px',
      borderRadius: '8px',
      border: '2px solid',
    };

    switch (node.type) {
      case 'start':
        return {
          ...regularStyle,
          backgroundColor: '#f0fdf4',
          borderColor: isSelected ? '#16a34a' : '#22c55e',
          color: '#15803d',
          borderRadius: '30px', // Circular for start node
        };
      case 'agent':
        return {
          ...regularStyle,
          backgroundColor: '#f0fdf4',
          borderColor: isSelected ? '#16a34a' : '#22c55e',
          color: '#15803d',
        };
      case 'tool':
        return {
          ...regularStyle,
          backgroundColor: '#eff6ff',
          borderColor: isSelected ? '#2563eb' : '#3b82f6',
          color: '#1d4ed8',
        };
      case 'function':
        return {
          ...regularStyle,
          backgroundColor: '#faf5ff',
          borderColor: isSelected ? '#9333ea' : '#a855f7',
          color: '#7c3aed',
        };
      case 'parallel':
        return {
          ...regularStyle,
          backgroundColor: '#ecfeff',
          borderColor: isSelected ? '#0891b2' : '#06b6d4',
          color: '#0e7490',
        };
      case 'end':
        return {
          ...regularStyle,
          backgroundColor: '#fef2f2',
          borderColor: isSelected ? '#dc2626' : '#ef4444',
          color: '#b91c1c',
          borderRadius: '30px',
        };
      default:
        return regularStyle;
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
      <span>
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
