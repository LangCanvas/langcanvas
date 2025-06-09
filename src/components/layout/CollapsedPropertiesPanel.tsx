
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
  const getSelectedItemSummary = () => {
    if (selectedNode) {
      return {
        type: selectedNode.type,
        name: selectedNode.label || selectedNode.id,
        icon: getNodeTypeIcon(selectedNode.type)
      };
    }
    if (selectedEdge) {
      return {
        type: 'edge',
        name: selectedEdge.label || 'Connection',
        icon: '🔗'
      };
    }
    return null;
  };

  const getNodeTypeIcon = (type: string) => {
    switch (type) {
      case 'start': return '▶';
      case 'agent': return '🤖';
      case 'tool': return '🔧';
      case 'function': return 'ƒ';
      case 'conditional': return '◆';
      case 'parallel': return '∥';
      case 'end': return '⏹';
      default: return '📄';
    }
  };

  const summary = getSelectedItemSummary();

  return (
    <div className="flex flex-col items-center py-4 space-y-4">
      {/* Expand button */}
      <button
        onClick={onExpand}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        title="Expand Properties Panel"
      >
        <FileText className="w-4 h-4 text-blue-600" />
      </button>

      {/* Selected item summary */}
      {summary ? (
        <div className="flex flex-col items-center space-y-2">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100">
            <span className="text-sm">{summary.icon}</span>
          </div>
          <div className="text-xs text-gray-600 text-center leading-tight">
            <div className="font-medium truncate w-12" title={summary.name}>
              {summary.name.length > 8 ? summary.name.substring(0, 8) + '...' : summary.name}
            </div>
            <div className="text-gray-400 text-xs">
              {summary.type}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-xs text-gray-400 text-center">
          <div>No</div>
          <div>Selection</div>
        </div>
      )}

      {/* Validation issues indicator */}
      {validationResult.issues.length > 0 && (
        <button
          onClick={onExpand}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors relative"
          title={`${validationResult.issues.length} validation issue${validationResult.issues.length !== 1 ? 's' : ''}`}
        >
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {validationResult.issues.length}
          </span>
        </button>
      )}

      {/* Settings button */}
      <button
        onClick={onExpand}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        title="Settings"
      >
        <Settings className="w-5 h-5 text-gray-500" />
      </button>
    </div>
  );
};

export default CollapsedPropertiesPanel;
