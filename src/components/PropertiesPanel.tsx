
import React from 'react';
import { Code } from 'lucide-react';

interface PropertiesPanelProps {
  selectedNode?: any;
  className?: string;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedNode, className }) => {
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

  return (
    <div className={`flex-1 p-4 ${className}`}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Node Type
          </label>
          <p className="text-sm text-gray-600">{selectedNode.type}</p>
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
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            placeholder="Enter description"
            defaultValue={selectedNode.description || ''}
          />
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
