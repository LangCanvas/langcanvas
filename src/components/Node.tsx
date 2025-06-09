import React, { useState, useRef } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { usePointerEvents } from '../hooks/usePointerEvents';
import { sanitizeNodeLabel } from '../utils/security';
import ConnectionHandle from './ConnectionHandle';

interface NodeComponentProps {
  node: EnhancedNode;
  isSelected: boolean;
  canCreateEdge: boolean;
  onSelect: (id: string) => void;
  onDoubleClick?: () => void;
  onMove: (id: string, x: number, y: number) => void;
  onDragStart?: (event: React.MouseEvent) => void;
  onStartConnection: (sourceNode: EnhancedNode, startX: number, startY: number) => void;
  validationClass?: string;
  validationTooltip?: string;
}

const NodeComponent: React.FC<NodeComponentProps> = ({ 
  node, 
  isSelected, 
  canCreateEdge, 
  onSelect, 
  onDoubleClick,
  onMove, 
  onDragStart,
  onStartConnection,
  validationClass = '',
  validationTooltip = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [initialScrollPosition, setInitialScrollPosition] = useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);
  const { getPointerEvent, addPointerEventListeners } = usePointerEvents();

  const sanitizedLabel = sanitizeNodeLabel(node.label);

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pointerEvent = getPointerEvent(e);
    pointerEvent.preventDefault();
    onSelect(node.id);
    
    if (onDragStart && 'clientX' in e) {
      onDragStart(e as React.MouseEvent);
    }
    
    const rect = nodeRef.current?.getBoundingClientRect();
    const canvas = document.getElementById('canvas');
    const canvasRect = canvas?.getBoundingClientRect();
    const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
    
    if (rect && canvasRect && scrollContainer) {
      const scrollLeft = scrollContainer.scrollLeft || 0;
      const scrollTop = scrollContainer.scrollTop || 0;
      
      setInitialScrollPosition({ x: scrollLeft, y: scrollTop });
      
      const canvasX = pointerEvent.clientX - canvasRect.left + scrollLeft;
      const canvasY = pointerEvent.clientY - canvasRect.top + scrollTop;
      
      setDragOffset({
        x: canvasX - node.x,
        y: canvasY - node.y
      });
      setIsDragging(true);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDoubleClick) {
      onDoubleClick();
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
        
        const canvasX = pointerEvent.clientX - canvasRect.left + scrollLeft;
        const canvasY = pointerEvent.clientY - canvasRect.top + scrollTop;
        
        const newX = Math.max(0, Math.min(
          canvasX - dragOffset.x,
          3000 - 120
        ));
        const newY = Math.max(0, Math.min(
          canvasY - dragOffset.y,
          3000 - 60
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
      touchAction: 'none',
    };

    if (node.type === 'conditional') {
      return {
        ...baseStyle,
        width: '80px',
        height: '80px',
        backgroundColor: isSelected ? '#c2410c' : '#fff4e6',
        border: `3px solid ${isSelected ? '#c2410c' : '#ea580c'}`,
        color: isSelected ? '#ffffff' : '#9a3412',
        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
        fontSize: '12px',
        fontWeight: '600',
        boxShadow: isDragging ? '0 6px 16px rgba(234, 88, 12, 0.25)' : '0 3px 8px rgba(234, 88, 12, 0.15)',
      };
    }

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
          backgroundColor: isSelected ? '#15803d' : '#f0fdf4',
          borderColor: isSelected ? '#15803d' : '#22c55e',
          color: isSelected ? '#ffffff' : '#15803d',
          borderRadius: '30px',
        };
      case 'agent':
        return {
          ...regularStyle,
          backgroundColor: isSelected ? '#15803d' : '#f0fdf4',
          borderColor: isSelected ? '#15803d' : '#22c55e',
          color: isSelected ? '#ffffff' : '#15803d',
        };
      case 'tool':
        return {
          ...regularStyle,
          backgroundColor: isSelected ? '#1d4ed8' : '#eff6ff',
          borderColor: isSelected ? '#1d4ed8' : '#3b82f6',
          color: isSelected ? '#ffffff' : '#1d4ed8',
        };
      case 'function':
        return {
          ...regularStyle,
          backgroundColor: isSelected ? '#6d28d9' : '#faf5ff',
          borderColor: isSelected ? '#6d28d9' : '#a855f7',
          color: isSelected ? '#ffffff' : '#7c3aed',
        };
      case 'parallel':
        return {
          ...regularStyle,
          backgroundColor: isSelected ? '#0e7490' : '#ecfeff',
          borderColor: isSelected ? '#0e7490' : '#06b6d4',
          color: isSelected ? '#ffffff' : '#0e7490',
        };
      case 'end':
        return {
          ...regularStyle,
          backgroundColor: isSelected ? '#b91c1c' : '#fef2f2',
          borderColor: isSelected ? '#b91c1c' : '#ef4444',
          color: isSelected ? '#ffffff' : '#b91c1c',
          borderRadius: '30px',
        };
      default:
        return regularStyle;
    }
  };

  const tooltipText = validationTooltip || undefined;

  return (
    <div
      ref={nodeRef}
      style={getNodeStyle()}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
      onDoubleClick={handleDoubleClick}
      className={`node ${node.type}-node ${isSelected ? 'selected' : ''} ${validationClass}`}
      data-node-id={node.id}
      data-node-type={node.type}
      title={tooltipText}
    >
      <span>
        {sanitizedLabel}
      </span>
      
      <ConnectionHandle
        node={node}
        canCreateEdge={canCreateEdge}
        onStartConnection={onStartConnection}
      />
    </div>
  );
};

export default NodeComponent;
