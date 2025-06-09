
import React from 'react';
import { Settings, FileText, AlertTriangle } from 'lucide-react';
import { EnhancedNode } from '../../types/nodeTypes';
import { EnhancedEdge } from '../../types/edgeTypes';
import { ValidationResult } from '../../hooks/useValidation';

interface CollapsedPropertiesPanelProps {
  selectedNode: EnhancedNode | null;
  selectedEdge: EnhancedEdge | null;
  validationResult: ValidationResult;
  onExpand: () => void;
}

const CollapsedPropertiesPanel: React.FC<CollapsedPropertiesPanelProps> = ({
  selectedNode,
  selectedEdge,
  validationResult,
  onExpand
}) => {
  return (
    <aside className="w-14 bg-white border-l border-gray-200 flex flex-col items-center py-4 space-y-4">
      {/* Properties Icon */}
      <button
        onClick={onExpand}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        title={selectedNode || selectedEdge ? 'View Properties' : 'Properties Panel'}
      >
        <FileText className={`w-5 h-5 ${selectedNode || selectedEdge ? 'text-blue-600' : 'text-gray-400'}`} />
      </button>

      {/* Validation Icon */}
      {validationResult.issues.length > 0 && (
        <button
          onClick={onExpand}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors relative"
          title={`${validationResult.issues.length} validation issue${validationResult.issues.length !== 1 ? 's' : ''}`}
        >
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {validationResult.issues.length}
          </span>
        </button>
      )}

      {/* Settings Icon */}
      <button
        onClick={onExpand}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        title="Settings"
      >
        <Settings className="w-5 h-5 text-gray-500" />
      </button>
    </aside>
  );
};

export default CollapsedPropertiesPanel;
