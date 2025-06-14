
import React from 'react';
import { BaseNodeProps } from '../../types/nodeProps';
import { useNodeDrag } from '../../hooks/useNodeDrag';
import { sanitizeNodeLabel } from '../../utils/security';

interface BaseNodeComponentProps extends BaseNodeProps {
  children: React.ReactNode;
  nodeStyle: React.CSSProperties;
}

const BaseNode: React.FC<BaseNodeComponentProps> = ({
  node,
  isSelected,
  onSelect,
  onDoubleClick,
  onMove,
  onDragStart,
  validationClass = '',
  validationTooltip = '',
  children,
  nodeStyle
}) => {
  const { nodeRef, isDragging, startDrag } = useNodeDrag(node, onMove, isSelected);
  const sanitizedLabel = sanitizeNodeLabel(node.label);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Check if this is a connection handle event by looking at the target
    const target = e.target as HTMLElement;
    const isConnectionHandle = target.closest('[data-handle]');
    
    if (isConnectionHandle) {
      // Don't interfere with connection handle events
      return;
    }
    
    // Always call onSelect first to update selection state
    onSelect(node.id, e);
    
    // Check if this will be a multi-drag scenario BEFORE calling onDragStart
    const willBeMultiDrag = isSelected || (e.ctrlKey || e.metaKey || e.shiftKey);
    
    if (willBeMultiDrag && onDragStart) {
      onDragStart(e);
    } else {
      startDrag(e);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDoubleClick) {
      onDoubleClick();
    }
  };

  return (
    <div
      ref={nodeRef}
      style={nodeStyle}
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
      className={`node ${node.type}-node ${isSelected ? 'selected' : ''} ${validationClass}`}
      data-node-id={node.id}
      data-node-type={node.type}
      title={validationTooltip || undefined}
    >
      <span style={{ transform: node.type === 'conditional' ? 'rotate(-45deg)' : 'none' }}>
        {sanitizedLabel}
      </span>
      {children}
    </div>
  );
};

export default BaseNode;
