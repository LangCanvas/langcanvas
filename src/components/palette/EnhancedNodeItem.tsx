
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NodeDefinition } from '../../utils/nodeCategories';
import { NodeType } from '../../types/nodeTypes';

interface EnhancedNodeItemProps {
  node: NodeDefinition;
  onDragStart: (e: React.DragEvent, nodeType: NodeType, label: string) => void;
  onClick: (e: React.MouseEvent, nodeType: NodeType) => void;
  showDescription?: boolean;
  compact?: boolean;
}

const EnhancedNodeItem: React.FC<EnhancedNodeItemProps> = ({
  node,
  onDragStart,
  onClick,
  showDescription = true,
  compact = false
}) => {
  const createDragImage = (nodeType: NodeType, label: string): HTMLElement => {
    const dragImage = document.createElement('div');
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.display = 'flex';
    dragImage.style.alignItems = 'center';
    dragImage.style.justifyContent = 'center';
    dragImage.style.fontSize = '14px';
    dragImage.style.fontWeight = '500';
    dragImage.style.userSelect = 'none';
    dragImage.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    dragImage.style.zIndex = '1000';
    dragImage.textContent = label;

    // Apply node-specific styling
    if (nodeType === 'conditional') {
      dragImage.style.width = '80px';
      dragImage.style.height = '80px';
      dragImage.style.backgroundColor = '#fff4e6';
      dragImage.style.border = '3px solid #ea580c';
      dragImage.style.color = '#9a3412';
      dragImage.style.clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
      dragImage.style.fontSize = '12px';
      dragImage.style.fontWeight = '600';
    } else {
      dragImage.style.width = '120px';
      dragImage.style.height = '60px';
      dragImage.style.border = '2px solid';
      
      switch (nodeType) {
        case 'start':
          dragImage.style.backgroundColor = '#f0fdf4';
          dragImage.style.borderColor = '#22c55e';
          dragImage.style.color = '#15803d';
          dragImage.style.borderRadius = '30px';
          break;
        case 'agent':
          dragImage.style.backgroundColor = '#f0fdf4';
          dragImage.style.borderColor = '#22c55e';
          dragImage.style.color = '#15803d';
          dragImage.style.borderRadius = '8px';
          break;
        case 'tool':
          dragImage.style.backgroundColor = '#eff6ff';
          dragImage.style.borderColor = '#3b82f6';
          dragImage.style.color = '#1d4ed8';
          dragImage.style.borderRadius = '8px';
          break;
        case 'function':
          dragImage.style.backgroundColor = '#faf5ff';
          dragImage.style.borderColor = '#a855f7';
          dragImage.style.color = '#7c3aed';
          dragImage.style.borderRadius = '8px';
          break;
        case 'parallel':
          dragImage.style.backgroundColor = '#ecfeff';
          dragImage.style.borderColor = '#06b6d4';
          dragImage.style.color = '#0e7490';
          dragImage.style.borderRadius = '8px';
          break;
        case 'end':
          dragImage.style.backgroundColor = '#fef2f2';
          dragImage.style.borderColor = '#ef4444';
          dragImage.style.color = '#b91c1c';
          dragImage.style.borderRadius = '30px';
          break;
        default:
          dragImage.style.borderRadius = '8px';
      }
    }

    return dragImage;
  };

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

  if (compact) {
    return (
      <Button
        variant="outline"
        className={`w-full h-8 ${node.color} border-2 border-dashed hover:border-solid transition-all duration-200 text-xs`}
        draggable
        onDragStart={handleDragStart}
        onClick={handleClick}
        title={node.description}
      >
        <span className="mr-1">{node.icon}</span>
        {node.label}
      </Button>
    );
  }

  return (
    <div className="group relative">
      <Button
        variant="outline"
        className={`w-full h-auto p-3 ${node.color} border-2 border-dashed hover:border-solid transition-all duration-200 flex flex-col items-start space-y-2`}
        draggable
        onDragStart={handleDragStart}
        onClick={handleClick}
      >
        <div className="flex items-center space-x-2 w-full">
          <span className="text-lg">{node.icon}</span>
          <span className="font-medium text-sm">{node.label}</span>
        </div>
        
        {showDescription && (
          <p className="text-xs text-left opacity-75 group-hover:opacity-100 transition-opacity">
            {node.description}
          </p>
        )}
        
        {node.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 w-full">
            {node.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-1 py-0 h-4">
                {tag}
              </Badge>
            ))}
            {node.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                +{node.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </Button>
    </div>
  );
};

export default EnhancedNodeItem;
