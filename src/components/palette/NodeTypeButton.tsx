
import React from 'react';
import { Button } from '@/components/ui/button';
import { NodeType } from '../../types/nodeTypes';

interface NodeTypeButtonProps {
  type: NodeType;
  label: string;
  color: string;
  onDragStart: (e: React.DragEvent, nodeType: NodeType, label: string) => void;
  onClick: (e: React.MouseEvent, nodeType: NodeType) => void;
}

const NodeTypeButton: React.FC<NodeTypeButtonProps> = ({
  type,
  label,
  color,
  onDragStart,
  onClick
}) => {
  return (
    <Button
      variant="outline"
      className={`w-full h-12 ${color} border-2 border-dashed hover:border-solid transition-all duration-200 touch-manipulation`}
      draggable
      onDragStart={(e) => onDragStart(e, type, label)}
      onClick={(e) => onClick(e, type)}
      style={{ 
        minHeight: '48px',
        touchAction: 'manipulation'
      }}
    >
      {label}
    </Button>
  );
};

export default NodeTypeButton;
