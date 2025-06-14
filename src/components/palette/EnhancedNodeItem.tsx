import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NodeDefinition } from '../../utils/nodeCategories';
import { NodeType } from '../../types/nodeTypes';
import { PanelLayout } from '../../hooks/useAdaptivePanelWidths';

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
  showDescription = true,
  compact = false,
  panelLayout = 'standard'
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
    dragImage.style.zIndex = '1000';
    dragImage.textContent = label;

    // Apply enhanced node-specific styling
    if (nodeType === 'conditional') {
      dragImage.style.width = '80px';
      dragImage.style.height = '80px';
      dragImage.style.backgroundColor = '#fef3c7';
      dragImage.style.border = '3px solid #f59e0b';
      dragImage.style.color = '#92400e';
      dragImage.style.clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
      dragImage.style.fontSize = '12px';
      dragImage.style.fontWeight = '600';
      dragImage.style.boxShadow = '0 8px 24px rgba(245, 158, 11, 0.3)';
    } else {
      dragImage.style.width = '120px';
      dragImage.style.height = '60px';
      dragImage.style.border = '2px solid';
      dragImage.style.borderRadius = '12px';
      
      switch (nodeType) {
        case 'start':
          dragImage.style.backgroundColor = '#dcfce7';
          dragImage.style.borderColor = '#22c55e';
          dragImage.style.color = '#15803d';
          dragImage.style.borderRadius = '30px';
          dragImage.style.boxShadow = '0 8px 24px rgba(34, 197, 94, 0.3)';
          break;
        case 'agent':
          dragImage.style.backgroundColor = '#d1fae5';
          dragImage.style.borderColor = '#10b981';
          dragImage.style.color = '#047857';
          dragImage.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.3)';
          break;
        case 'tool':
          dragImage.style.backgroundColor = '#dbeafe';
          dragImage.style.borderColor = '#3b82f6';
          dragImage.style.color = '#1e40af';
          dragImage.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.3)';
          break;
        case 'function':
          dragImage.style.backgroundColor = '#ede9fe';
          dragImage.style.borderColor = '#8b5cf6';
          dragImage.style.color = '#6d28d9';
          dragImage.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.3)';
          break;
        case 'parallel':
          dragImage.style.backgroundColor = '#cffafe';
          dragImage.style.borderColor = '#06b6d4';
          dragImage.style.color = '#0891b2';
          dragImage.style.boxShadow = '0 8px 24px rgba(6, 182, 212, 0.3)';
          break;
        case 'end':
          dragImage.style.backgroundColor = '#fee2e2';
          dragImage.style.borderColor = '#ef4444';
          dragImage.style.color = '#dc2626';
          dragImage.style.borderRadius = '30px';
          dragImage.style.boxShadow = '0 8px 24px rgba(239, 68, 68, 0.3)';
          break;
        default:
          dragImage.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
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

  // Enhanced color mapping for better visual consistency
  const getEnhancedNodeColors = (nodeType: NodeType) => {
    switch (nodeType) {
      case 'start':
        return 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100 hover:border-green-300';
      case 'agent':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-300';
      case 'tool':
        return 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100 hover:border-blue-300';
      case 'function':
        return 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100 hover:border-purple-300';
      case 'conditional':
        return 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 hover:border-amber-300';
      case 'parallel':
        return 'bg-cyan-50 border-cyan-200 text-cyan-800 hover:bg-cyan-100 hover:border-cyan-300';
      case 'end':
        return 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100 hover:border-red-300';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100 hover:border-gray-300';
    }
  };

  // Ultra-compact layout for very narrow panels
  if (panelLayout === 'ultra-compact') {
    return (
      <div className="group">
        <Button
          variant="outline"
          className={`w-full h-6 ${getEnhancedNodeColors(node.type)} border transition-all duration-200 text-xs p-1 shadow-sm hover:shadow-md active:scale-95`}
          draggable
          onDragStart={handleDragStart}
          onClick={handleClick}
          title={`${node.label}: ${node.description}`}
        >
          <span className="text-xs">{node.icon}</span>
        </Button>
      </div>
    );
  }

  // Compact layout
  if (compact || panelLayout === 'compact') {
    return (
      <div className="group">
        <Button
          variant="outline"
          className={`w-full h-8 ${getEnhancedNodeColors(node.type)} border-2 transition-all duration-200 text-xs shadow-sm hover:shadow-md active:scale-95`}
          draggable
          onDragStart={handleDragStart}
          onClick={handleClick}
          title={node.description}
        >
          <span className="mr-1.5 text-sm">{node.icon}</span>
          <span className="font-medium truncate">{node.label}</span>
        </Button>
      </div>
    );
  }

  // Standard and wide layouts
  const showTags = panelLayout === 'wide' && node.tags.length > 0;
  const maxTags = panelLayout === 'wide' ? 5 : 3;

  return (
    <div className="group relative">
      <Button
        variant="outline"
        className={`w-full h-auto p-4 ${getEnhancedNodeColors(node.type)} border-2 transition-all duration-200 flex flex-col items-start space-y-3 shadow-sm hover:shadow-md active:scale-[0.98] group-hover:shadow-lg`}
        draggable
        onDragStart={handleDragStart}
        onClick={handleClick}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            <span className={panelLayout === 'wide' ? 'text-xl' : 'text-lg'}>{node.icon}</span>
            <span className="font-semibold text-sm">{node.label}</span>
          </div>
          {showTags && (
            <Badge variant="secondary" className="text-xs px-2 py-0.5 h-5 bg-white/50">
              {node.tags.length}
            </Badge>
          )}
        </div>
        
        {showDescription && (
          <p className="text-xs text-left leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
            {node.description}
          </p>
        )}
        
        {showTags && showDescription && (
          <div className="flex flex-wrap gap-1.5 w-full">
            {node.tags.slice(0, maxTags).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5 h-5 bg-white/70">
                {tag}
              </Badge>
            ))}
            {node.tags.length > maxTags && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5 h-5 bg-white/70">
                +{node.tags.length - maxTags}
              </Badge>
            )}
          </div>
        )}
      </Button>
    </div>
  );
};

export default EnhancedNodeItem;
