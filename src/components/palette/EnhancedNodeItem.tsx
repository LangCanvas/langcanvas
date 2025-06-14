
import React from 'react';
import { NodeDefinition } from '../../utils/nodeCategories';
import { NodeType } from '../../types/nodeTypes';
import { PanelLayout } from '../../hooks/useAdaptivePanelWidths';
import { createDragImage } from './DragImageCreator';
import SmallLayoutNodeItem from './SmallLayoutNodeItem';
import MediumLayoutNodeItem from './MediumLayoutNodeItem';

interface EnhancedNodeItemProps {
  node: NodeDefinition;
  onDragStart: (e: React.DragEvent, nodeType: NodeType, label: string) => void;
  onClick: (e: React.MouseEvent, nodeType: NodeType) => void;
  showDescription?: boolean;
  compact?: boolean;
  panelLayout?: PanelLayout;
}

const EnhancedNodeItem: React.FC<EnhancedNodeItemProps> = ({
  node,
  onDragStart,
  onClick,
  showDescription = false,
  compact = false,
  panelLayout = 'medium'
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    const dragImage = createDragImage(node.type, node.label);
    document.body.appendChild(dragImage);
    
    const isConditional = node.type === 'conditional';
    const width = isConditional ? 80 : 120;
    const height = isConditional ? 80 : 60;
    const offsetX = width / 2;
    const offsetY = height / 2;
    
    e.dataTransfer.setDragImage(dragImage, offsetX, offsetY);
    e.dataTransfer.setData('text/plain', node.type);
    e.dataTransfer.setData('application/offset', JSON.stringify({ x: offsetX, y: offsetY }));
    e.dataTransfer.effectAllowed = 'copy';
    
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
    }, 0);

    onDragStart(e, node.type, node.label);
  };

  const handleClick = (e: React.MouseEvent) => {
    onClick(e, node.type);
  };

  // Small layout: icon-only, very compact with tooltip
  if (panelLayout === 'small') {
    return (
      <SmallLayoutNodeItem
        node={node}
        onDragStart={handleDragStart}
        onClick={handleClick}
      />
    );
  }

  // Medium layout: full functionality with text
  return (
    <MediumLayoutNodeItem
      node={node}
      onDragStart={handleDragStart}
      onClick={handleClick}
      showDescription={showDescription}
    />
  );
};

export default EnhancedNodeItem;
