
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
  const { nodeRef, isDragging, startDrag } = useNodeDrag(node, onMove);
  const sanitizedLabel = sanitizeNodeLabel(node.label);

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    onSelect(node.id);
    
    if (onDragStart && 'clientX' in e) {
      onDragStart(e as React.MouseEvent);
    }
    
    startDrag(e);
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
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
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
