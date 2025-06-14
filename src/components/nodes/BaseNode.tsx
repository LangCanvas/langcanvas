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
    // Pass the event to onSelect for multi-selection support.
    // PointerEvent is a type of MouseEvent, so this is safe.
    onSelect(node.id, e);
    
    if (onDragStart) {
      onDragStart(e);
    }
    
    // startDrag now has internal logic to ignore if the node is already selected.
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
