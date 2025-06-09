
import React from 'react';
import { ValidationResult } from '../../hooks/useValidation';

interface BottomStatusBarProps {
  isSelecting: boolean;
  selectedCount: number;
  pendingNodeType?: string | null;
  isCreatingEdge?: boolean;
  validationResult?: ValidationResult;
  hasUnsavedChanges?: boolean;
}

const BottomStatusBar: React.FC<BottomStatusBarProps> = ({
  isSelecting,
  selectedCount,
  pendingNodeType,
  isCreatingEdge,
  validationResult,
  hasUnsavedChanges = false
}) => {
  const getStatusMessage = () => {
    if (pendingNodeType) {
      return `Click on the canvas to place the ${pendingNodeType} node`;
    }
    
    if (isCreatingEdge) {
      return 'Drag to another node to create a connection';
    }
    
    if (isSelecting) {
      return 'Drag to select multiple nodes';
    }
    
    if (selectedCount > 0) {
      return `${selectedCount} node${selectedCount > 1 ? 's' : ''} selected`;
    }
    
    if (hasUnsavedChanges) {
      return 'Unsaved changes';
    }
    
    return '';
  };

  const getStatusColor = () => {
    if (pendingNodeType) return 'bg-green-100 text-green-800 border-green-300';
    if (isCreatingEdge) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (isSelecting) return 'bg-purple-100 text-purple-800 border-purple-300';
    if (selectedCount > 0) return 'bg-gray-100 text-gray-800 border-gray-300';
    if (hasUnsavedChanges) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const statusMessage = getStatusMessage();

  return (
    <div className="fixed bottom-0 left-0 right-0 h-8 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-4">
          {statusMessage && (
            <div className={`px-2 py-1 rounded text-xs border ${getStatusColor()}`}>
              {statusMessage}
            </div>
          )}
          
          {validationResult && validationResult.issues.length > 0 && (
            <div className="text-xs text-red-600">
              {validationResult.errorCount} errors, {validationResult.warningCount} warnings
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-500">
          LangCanvas
        </div>
      </div>
    </div>
  );
};

export default BottomStatusBar;
