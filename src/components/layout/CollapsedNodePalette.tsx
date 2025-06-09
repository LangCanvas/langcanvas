
import React from 'react';
import { Plus, Shapes, Workflow } from 'lucide-react';

interface CollapsedNodePaletteProps {
  onExpand: () => void;
}

const CollapsedNodePalette: React.FC<CollapsedNodePaletteProps> = ({ onExpand }) => {
  return (
    <aside className="w-14 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-4">
      {/* Add Node Icon */}
      <button
        onClick={onExpand}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        title="Expand Node Palette"
      >
        <Plus className="w-5 h-5 text-blue-600" />
      </button>

      {/* Node Types Icon */}
      <button
        onClick={onExpand}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        title="Node Types"
      >
        <Shapes className="w-5 h-5 text-gray-500" />
      </button>

      {/* Workflow Icon */}
      <button
        onClick={onExpand}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        title="Workflow Tools"
      >
        <Workflow className="w-5 h-5 text-gray-500" />
      </button>
    </aside>
  );
};

export default CollapsedNodePalette;
