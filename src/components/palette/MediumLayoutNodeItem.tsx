
import React from 'react';
import { Button } from '@/components/ui/button';
import { NodeDefinition } from '../../utils/nodeCategories';
import { getEnhancedNodeColors } from './NodeColorUtils';

interface MediumLayoutNodeItemProps {
  node: NodeDefinition;
  onDragStart: (e: React.DragEvent) => void;
  onClick: (e: React.MouseEvent) => void;
  showDescription?: boolean;
}

const MediumLayoutNodeItem: React.FC<MediumLayoutNodeItemProps> = ({
  node,
  onDragStart,
  onClick,
  showDescription = false
}) => {
  return (
    <div className="group relative">
      <Button
        variant="outline"
        className={`w-full h-auto p-3 ${getEnhancedNodeColors(node.type)} border-2 transition-all duration-200 flex flex-col items-start space-y-2 shadow-sm hover:shadow-md active:scale-[0.98] group-hover:shadow-lg`}
        draggable
        onDragStart={onDragStart}
        onClick={onClick}
      >
        <div className="flex items-center space-x-2 w-full">
          <span className="text-lg flex-shrink-0">{node.icon}</span>
          <span className="font-semibold text-sm flex-1 text-left">{node.label}</span>
        </div>
        
        {showDescription && (
          <p className="text-xs text-left leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
            {node.description}
          </p>
        )}
      </Button>
    </div>
  );
};

export default MediumLayoutNodeItem;
