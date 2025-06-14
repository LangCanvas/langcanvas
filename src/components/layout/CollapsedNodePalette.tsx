import React from 'react';
import { PanelLeft, PanelLeftClose } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NodeType } from '../../types/nodeTypes';

interface CollapsedNodePaletteProps {
  onToggle: () => void;
  isExpanded: boolean;
}

const CollapsedNodePalette: React.FC<CollapsedNodePaletteProps> = ({ onToggle, isExpanded }) => {
  const nodeTypes = [
    { type: 'start' as NodeType, label: 'Start', icon: '▶', color: 'text-green-600' },
    { type: 'agent' as NodeType, label: 'Agent', icon: '🤖', color: 'text-green-600' },
    { type: 'tool' as NodeType, label: 'Tool', icon: '🔧', color: 'text-blue-600' },
    { type: 'function' as NodeType, label: 'Function', icon: 'ƒ', color: 'text-purple-600' },
    { type: 'conditional' as NodeType, label: 'Conditional', icon: '◆', color: 'text-orange-600' },
    { type: 'parallel' as NodeType, label: 'Parallel', icon: '∥', color: 'text-cyan-600' },
    { type: 'end' as NodeType, label: 'End', icon: '⏹', color: 'text-red-600' }
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

  const handleClick = (nodeType: NodeType) => {
    // Set the node type on canvas for next tap (mobile fallback)
    const canvas = document.getElementById('canvas');
    if (canvas) {
      canvas.setAttribute('data-node-type', nodeType);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <button
          onClick={onToggle}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          title={isExpanded ? 'Collapse Node Palette' : 'Expand Node Palette'}
        >
          {isExpanded ? <PanelLeftClose className="w-4 h-4 text-gray-700" /> : <PanelLeft className="w-4 h-4 text-gray-700" />}
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col items-center py-2 space-y-3 px-2">
          {nodeTypes.map(({ type, label, icon, color }) => (
            <button
              key={type}
              className={`w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors ${color} cursor-grab active:cursor-grabbing`}
              draggable
              onDragStart={(e) => handleDragStart(e, type, label)}
              onClick={() => handleClick(type)}
              title={label}
            >
              <span className="text-sm font-bold select-none">{icon}</span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CollapsedNodePalette;
