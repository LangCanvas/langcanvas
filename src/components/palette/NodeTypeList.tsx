
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NodeType } from '../../types/nodeTypes';
import NodeTypeButton from './NodeTypeButton';

interface NodeTypeListProps {
  onDragStart: (e: React.DragEvent, nodeType: NodeType, label: string) => void;
  onClick: (e: React.MouseEvent, nodeType: NodeType) => void;
}

const NodeTypeList: React.FC<NodeTypeListProps> = ({ onDragStart, onClick }) => {
  const nodeTypes = [
    { type: 'start' as NodeType, label: 'Start', color: 'bg-green-100 border-green-300 text-green-800' },
    { type: 'agent' as NodeType, label: 'Agent', color: 'bg-green-100 border-green-300 text-green-800' },
    { type: 'tool' as NodeType, label: 'Tool', color: 'bg-blue-100 border-blue-300 text-blue-800' },
    { type: 'function' as NodeType, label: 'Function', color: 'bg-purple-100 border-purple-300 text-purple-800' },
    { type: 'conditional' as NodeType, label: 'Conditional', color: 'bg-orange-100 border-orange-300 text-orange-800' },
    { type: 'parallel' as NodeType, label: 'Parallel', color: 'bg-cyan-100 border-cyan-300 text-cyan-800' },
    { type: 'end' as NodeType, label: 'End', color: 'bg-red-100 border-red-300 text-red-800' }
  ];

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-3 pr-3">
        {nodeTypes.map(({ type, label, color }) => (
          <NodeTypeButton
            key={type}
            type={type}
            label={label}
            color={color}
            onDragStart={onDragStart}
            onClick={onClick}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default NodeTypeList;
