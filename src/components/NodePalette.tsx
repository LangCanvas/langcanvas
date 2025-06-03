import React from 'react';
import { Button } from '@/components/ui/button';
import { NodeType } from '../types/nodeTypes';

interface NodePaletteProps {
  onNodeTypeSelect?: (type: NodeType) => void;
}

const NodePalette: React.FC<NodePaletteProps> = ({ onNodeTypeSelect }) => {
  const nodeTypes = [
    { type: 'start' as NodeType, label: 'Start', color: 'bg-green-100 border-green-300 text-green-800' },
    { type: 'agent' as NodeType, label: 'Agent', color: 'bg-green-100 border-green-300 text-green-800' },
    { type: 'tool' as NodeType, label: 'Tool', color: 'bg-blue-100 border-blue-300 text-blue-800' },
    { type: 'function' as NodeType, label: 'Function', color: 'bg-purple-100 border-purple-300 text-purple-800' },
    { type: 'conditional' as NodeType, label: 'Conditional', color: 'bg-orange-100 border-orange-300 text-orange-800' },
    { type: 'parallel' as NodeType, label: 'Parallel', color: 'bg-cyan-100 border-cyan-300 text-cyan-800' },
    { type: 'end' as NodeType, label: 'End', color: 'bg-red-100 border-red-300 text-red-800' }
  ];

  const handleDragStart = (e: React.DragEvent, nodeType: NodeType) => {
    e.dataTransfer.setData('text/plain', nodeType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleClick = (e: React.MouseEvent, nodeType: NodeType) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log(`🎯 Node palette clicked: ${nodeType}`);
    
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
    <div className="p-4">
      <h2 className="text-sm font-medium text-gray-700 mb-4">Node Palette</h2>
      <div className="space-y-3">
        {nodeTypes.map(({ type, label, color }) => (
          <Button
            key={type}
            variant="outline"
            className={`w-full h-12 ${color} border-2 border-dashed hover:border-solid transition-all duration-200 touch-manipulation`}
            draggable
            onDragStart={(e) => handleDragStart(e, type)}
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
      <div className="mt-6 text-xs text-gray-500">
        <p className="hidden lg:block">Drag nodes to the canvas to create them</p>
        <p className="lg:hidden">Tap a node type, then tap on the canvas to place it</p>
      </div>
    </div>
  );
};

export default NodePalette;
