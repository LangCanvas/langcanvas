
import React from 'react';
import { NodeType } from '../types/nodeTypes';
import { useEnhancedAnalytics } from '../hooks/useEnhancedAnalytics';
import { createDragImage } from './palette/DragImageCreator';
import PaletteHeader from './palette/PaletteHeader';
import NodeTypeList from './palette/NodeTypeList';

interface NodePaletteProps {
  onNodeTypeSelect?: (type: NodeType) => void;
  onToggle?: () => void;
  isExpanded?: boolean;
}

const NodePalette: React.FC<NodePaletteProps> = ({ onNodeTypeSelect, onToggle, isExpanded = true }) => {
  const analytics = useEnhancedAnalytics();

  const handleDragStart = (e: React.DragEvent, nodeType: NodeType, label: string) => {
    analytics.trackFeatureUsage('node_palette_drag_start', { 
      nodeType, 
      method: 'drag_and_drop' 
    });

    const dragImage = createDragImage(nodeType, label);
    document.body.appendChild(dragImage);
    
    const isConditional = nodeType === 'conditional';
    const width = isConditional ? 80 : 120;
    const height = isConditional ? 80 : 60;
    const offsetX = width / 2;
    const offsetY = height / 2;
    
    e.dataTransfer.setDragImage(dragImage, offsetX, offsetY);
    e.dataTransfer.setData('text/plain', nodeType);
    e.dataTransfer.setData('application/offset', JSON.stringify({ x: offsetX, y: offsetY }));
    e.dataTransfer.effectAllowed = 'copy';
    
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
    
    analytics.trackFeatureUsage('node_palette_click', { 
      nodeType, 
      method: 'click_to_select' 
    });
    
    if (onNodeTypeSelect) {
      onNodeTypeSelect(nodeType);
    } else {
      const canvas = document.getElementById('canvas');
      if (canvas) {
        canvas.setAttribute('data-node-type', nodeType);
        
        const instruction = document.createElement('div');
        instruction.className = 'fixed top-4 left-4 right-4 bg-blue-100 border border-blue-300 rounded-lg p-3 text-blue-800 text-sm z-50 lg:hidden';
        instruction.textContent = `Tap on the canvas to place the ${nodeType} node`;
        document.body.appendChild(instruction);
        
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
      <PaletteHeader title="Node Palette" onToggle={onToggle} />
      
      <NodeTypeList onDragStart={handleDragStart} onClick={handleClick} />

      <div className="mt-4 text-xs text-gray-500">
        <p className="hidden lg:block">Drag nodes to the canvas to create them</p>
        <p className="lg:hidden">Tap a node type, then tap on the canvas to place it</p>
      </div>
    </div>
  );
};

export default NodePalette;
