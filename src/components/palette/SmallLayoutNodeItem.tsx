
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { NodeDefinition } from '../../utils/nodeCategories';
import { NodeType } from '../../types/nodeTypes';
import { getEnhancedNodeColors } from './NodeColorUtils';

interface SmallLayoutNodeItemProps {
  node: NodeDefinition;
  onDragStart: (e: React.DragEvent) => void;
  onClick: (e: React.MouseEvent) => void;
}

const SmallLayoutNodeItem: React.FC<SmallLayoutNodeItemProps> = ({
  node,
  onDragStart,
  onClick
}) => {
  return (
    <div className="group">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className={`w-[70px] h-[19px] ${getEnhancedNodeColors(node.type)} border transition-all duration-200 text-xs p-1 shadow-sm hover:shadow-md active:scale-95 relative flex items-center justify-center`}
              draggable
              onDragStart={onDragStart}
              onClick={onClick}
            >
              <span className="text-xs absolute left-2">{node.icon}</span>
              <span className="text-xs font-medium text-center flex-1 pl-6">{node.label}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            <div className="font-medium">{node.label}</div>
            <div className="text-xs opacity-80 mt-1">{node.description}</div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default SmallLayoutNodeItem;
