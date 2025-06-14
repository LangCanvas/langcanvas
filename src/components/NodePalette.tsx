import React from 'react';
import { PanelLeftClose } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NodeType } from '../types/nodeTypes';
import { useEnhancedAnalytics } from '../hooks/useEnhancedAnalytics';

interface NodePaletteProps {
  onNodeTypeSelect?: (type: NodeType) => void;
  onToggle?: () => void;
  isExpanded?: boolean;
}

const NodePalette: React.FC<NodePaletteProps> = ({ onNodeTypeSelect, onToggle, isExpanded = true }) => {
  const analytics = useEnhancedAnalytics();
  
  const nodeTypes = [
    { type: 'start' as NodeType, label: 'Start', color: 'bg-green-100 border-green-300 text-green-800' },
    { type: 'agent' as NodeType, label: 'Agent', color: 'bg-green-100 border-green-300 text-green-800' },
    { type: 'tool' as NodeType, label: 'Tool', color: 'bg-blue-100 border-blue-300 text-blue-800' },
    { type: 'function' as NodeType, label: 'Function', color: 'bg-purple-100 border-purple-300 text-purple-800' },
    { type: 'conditional' as NodeType, label: 'Conditional', color: 'bg-orange-100 border-orange-300 text-orange-800' },
    { type: 'parallel' as NodeType, label: 'Parallel', color: 'bg-cyan-100 border-cyan-300 text-cyan-800' },
    { type: 'end' as NodeType, label: 'End', color: 'bg-red-100 border-red-300 text-red-800' }
  ];

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

  const handleDragStart = (e: React.DragEvent, nodeType: NodeType, label: string) => {
    // Track drag start
    analytics.trackFeatureUsage('node_palette_drag_start', { 
      nodeType, 
      method: 'drag_and_drop' 
    });

    // Create custom drag image
    const dragImage = createDragImage(nodeType, label);
    document.body.appendChild(dragImage);
    
    // Calculate offset from center of the drag image
    const isConditional = nodeType === 'conditional';
    const width = isConditional ? 80 : 120;
    const height = isConditional ? 80 : 60;
    const offsetX = width / 2;
    const offsetY = height / 2;
    
    // Set the custom drag image
    e.dataTransfer.setDragImage(dragImage, offsetX, offsetY);
    
    // Store node type and offset in drag data
    e.dataTransfer.setData('text/plain', nodeType);
    e.dataTransfer.setData('application/offset', JSON.stringify({ x: offsetX, y: offsetY }));
    e.dataTransfer.effectAllowed = 'copy';
    
    // Clean up the temporary drag image after a short delay
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
    }, 0);
  };

  const handleClick = (e: React.MouseEvent, nodeType: NodeType) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log(`🎯 Node palette clicked: ${nodeType}`);
    
    // Track node type selection
    analytics.trackFeatureUsage('node_palette_click', { 
      nodeType, 
      method: 'click_to_select' 
    });
    
    if (onNodeTypeSelect) {
      onNodeTypeSelect(nodeType);
    } else {
      // Fallback for mobile: set the node type on canvas for next tap
      const canvas = document.getElementById('canvas');
      if (canvas) {
        canvas.setAttribute('data-node-type', nodeType);
        
        // Show visual feedback
        const instruction = document.createElement('div');
        instruction.className = 'fixed top-4 left-4 right-4 bg-blue-100 border border-blue-300 rounded-lg p-3 text-blue-800 text-sm z-50 lg:hidden';
        instruction.textContent = `Tap on the canvas to place the ${nodeType} node`;
        document.body.appendChild(instruction);
        
        // Remove instruction after 3 seconds
        setTimeout(() => {
          if (document.body.contains(instruction)) {
            document.body.removeChild(instruction);
          }
        }, 3000);
      }
    }
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-700">Node Palette</h2>
        {onToggle && (
          <button
            onClick={onToggle}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            title="Collapse Node Palette"
          >
            <PanelLeftClose className="w-4 h-4 text-gray-700" />
          </button>
        )}
      </div>
      
      <ScrollArea className="flex-1">
        <div className="space-y-3 pr-3">
          {nodeTypes.map(({ type, label, color }) => (
            <Button
              key={type}
              variant="outline"
              className={`w-full h-12 ${color} border-2 border-dashed hover:border-solid transition-all duration-200 touch-manipulation`}
              draggable
              onDragStart={(e) => handleDragStart(e, type, label)}
              onClick={(e) => handleClick(e, type)}
              style={{ 
                minHeight: '48px',
                touchAction: 'manipulation'
              }}
            >
              {label}
            </Button>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-4 text-xs text-gray-500">
        <p className="hidden lg:block">Drag nodes to the canvas to create them</p>
        <p className="lg:hidden">Tap a node type, then tap on the canvas to place it</p>
      </div>
    </div>
  );
};

export default NodePalette;
