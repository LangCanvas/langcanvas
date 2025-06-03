
import React from 'react';
import { Play, Wrench, GitBranch, Square } from 'lucide-react';

export interface NodeType {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const nodeTypes: NodeType[] = [
  {
    id: 'start',
    name: 'Start',
    icon: <Play className="w-5 h-5" />,
    color: 'text-green-600',
    description: 'Starting point of the workflow'
  },
  {
    id: 'tool',
    name: 'Tool',
    icon: <Wrench className="w-5 h-5" />,
    color: 'text-blue-600',
    description: 'Execute a tool or function'
  },
  {
    id: 'condition',
    name: 'Condition',
    icon: <GitBranch className="w-5 h-5" />,
    color: 'text-orange-600',
    description: 'Conditional branching logic'
  },
  {
    id: 'end',
    name: 'End',
    icon: <Square className="w-5 h-5" />,
    color: 'text-red-600',
    description: 'End point of the workflow'
  }
];

const NodePalette: React.FC = () => {
  const handleDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/json', JSON.stringify(nodeType));
    console.log(`Dragging ${nodeType.name} node`);
  };

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Available Nodes</h3>
      <div className="space-y-2">
        {nodeTypes.map((nodeType) => (
          <div
            key={nodeType.id}
            className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-grab hover:bg-gray-100 transition-colors active:cursor-grabbing"
            draggable="true"
            onDragStart={(e) => handleDragStart(e, nodeType)}
            title={nodeType.description}
          >
            <div className={nodeType.color}>
              {nodeType.icon}
            </div>
            <span className="ml-3 text-sm font-medium text-gray-700">
              {nodeType.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NodePalette;
