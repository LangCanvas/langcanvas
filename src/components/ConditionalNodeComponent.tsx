import React, { useState, useRef } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { EnhancedEdge } from '../types/edgeTypes';
import { usePointerEvents } from '../hooks/usePointerEvents';
import { sanitizeNodeLabel } from '../utils/security';

interface ConditionalNodeComponentProps {
  node: EnhancedNode;
  outgoingEdges: EnhancedEdge[];
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

const ConditionalNodeComponent: React.FC<ConditionalNodeComponentProps> = ({ 
  node, 
  outgoingEdges,
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
  const nodeRef = useRef<HTMLDivElement>(null);
  const { getPointerEvent, addPointerEventListeners } = usePointerEvents();

  // Sanitize the node label to prevent XSS
  const sanitizedLabel = sanitizeNodeLabel(node.label);

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pointerEvent = getPointerEvent(e);
    pointerEvent.preventDefault();
    onSelect(node.id);
    
    // Call onDragStart for multi-node dragging
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

  const handleConnectionStart = (e: React.MouseEvent | React.TouchEvent) => {
    const pointerEvent = getPointerEvent(e);
    e.stopPropagation();
    
    if (canCreateEdge) {
      const canvas = document.getElementById('canvas');
      const canvasRect = canvas?.getBoundingClientRect();
      const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
      
      if (canvasRect && scrollContainer) {
        const scrollLeft = scrollContainer.scrollLeft || 0;
        const scrollTop = scrollContainer.scrollTop || 0;
        
        const startX = node.x + 60;
        const startY = node.y + 40;
        
        onStartConnection(node, startX, startY);
      }
    }
  };

  const nodeStyle = {
    position: 'absolute' as const,
    left: node.x,
    top: node.y,
    width: '80px',
    height: '80px',
    backgroundColor: isSelected ? '#ea580c' : '#fff4e6',
    border: `3px solid ${isSelected ? '#d97706' : '#ea580c'}`,
    color: isSelected ? '#ffffff' : '#9a3412',
    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
    fontSize: '12px',
    fontWeight: '600',
    boxShadow: isDragging ? '0 6px 16px rgba(234, 88, 12, 0.25)' : '0 3px 8px rgba(234, 88, 12, 0.15)',
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none' as const,
    touchAction: 'none',
    zIndex: isSelected ? 10 : 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const conditionCount = outgoingEdges.filter(edge => edge.conditional).length;
  const maxConditions = 8;

  return (
    <div
      ref={nodeRef}
      style={nodeStyle}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
      onDoubleClick={handleDoubleClick}
      className={`conditional-node ${isSelected ? 'selected' : ''} ${validationClass}`}
      data-node-id={node.id}
      data-node-type={node.type}
      title={validationTooltip}
    >
      <span>{sanitizedLabel}</span>
      
      {canCreateEdge && conditionCount < maxConditions && (
        <div
          className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-orange-500 border-2 border-white rounded-full cursor-pointer hover:bg-orange-600 hover:scale-110 transition-all shadow-md"
          onMouseDown={handleConnectionStart}
          onTouchStart={handleConnectionStart}
          title="Add condition branch"
        />
      )}
      
      {conditionCount > 0 && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
          {conditionCount}
        </div>
      )}
    </div>
  );
};

export default ConditionalNodeComponent;
