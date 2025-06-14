
import React from 'react';
import { NodeDefinition } from '../../utils/nodeCategories';
import { getEnhancedNodeColors } from './NodeColorUtils';
import './NodePaletteAlignment.css';

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
    <div className="group relative node-palette-left-align">
      <div
        role="button"
        tabIndex={0}
        className={`w-full h-auto p-3 ${getEnhancedNodeColors(node.type)} border-2 border-input bg-background rounded-md transition-all duration-200 flex flex-col items-start space-y-2 shadow-sm hover:shadow-md hover:bg-accent hover:text-accent-foreground active:scale-[0.98] group-hover:shadow-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
        draggable
        onDragStart={onDragStart}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(e as any);
          }
        }}
      >
        <div className="flex items-start justify-start space-x-2 w-full">
          <span className="text-lg flex-shrink-0">
            {node.icon}
          </span>
          <span className="font-semibold text-sm w-full">
            {node.label}
          </span>
        </div>
        
        {showDescription && (
          <p className="text-xs leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity w-full">
            {node.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default MediumLayoutNodeItem;
