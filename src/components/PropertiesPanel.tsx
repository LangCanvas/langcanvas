
import React from 'react';
import { Code, Trash2 } from 'lucide-react';
import { Node } from '../hooks/useNodes';
import { Button } from '@/components/ui/button';

interface PropertiesPanelProps {
  selectedNode?: Node;
  className?: string;
  onDeleteNode?: (id: string) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedNode, className, onDeleteNode }) => {
  if (!selectedNode) {
    return (
      <div className={`flex-1 p-4 ${className}`}>
        <div className="flex items-center justify-center h-full text-center text-gray-400">
          <div>
            <div className="mb-2">
              <Code className="w-8 h-8 mx-auto mb-3 opacity-30" />
            </div>
            <p className="text-sm">Select a node to edit its properties</p>
          </div>
        </div>
      </div>
    );
  }

  const getNodeTypeDisplayName = (type: string) => {
    switch (type) {
      case 'start': return 'Start Node';
      case 'tool': return 'Tool Node';
      case 'condition': return 'Condition Node';
      case 'end': return 'End Node';
      default: return 'Unknown Node';
    }
  };

  return (
    <div className={`flex-1 p-4 ${className}`}>
      <div className="space-y-4">
        <div className="pb-2 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700">Node Properties</h3>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Node Type
          </label>
          <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded border">
            {getNodeTypeDisplayName(selectedNode.type)}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter node name"
            defaultValue={selectedNode.name || ''}
            readOnly
            title="Node name editing will be available in a future update"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Position
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">X</label>
              <input
                type="number"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-gray-50"
                value={Math.round(selectedNode.x)}
                readOnly
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Y</label>
              <input
                type="number"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-gray-50"
                value={Math.round(selectedNode.y)}
                readOnly
              />
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            placeholder="Node description (read-only)"
            readOnly
            title="Node description editing will be available in a future update"
          />
        </div>

        {onDeleteNode && (
          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDeleteNode(selectedNode.id)}
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Node
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              You can also press Delete key to remove the selected node
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;
