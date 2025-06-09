
import React from 'react';

interface ToolbarSelectionStatusProps {
  isSelecting: boolean;
  selectedCount: number;
}

const ToolbarSelectionStatus: React.FC<ToolbarSelectionStatusProps> = ({
  isSelecting,
  selectedCount
}) => {
  if (!isSelecting && selectedCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border">
      {isSelecting ? (
        <span>🔲 Drag to select nodes</span>
      ) : selectedCount > 0 ? (
        <span>📋 {selectedCount} node{selectedCount > 1 ? 's' : ''} selected</span>
      ) : null}
    </div>
  );
};

export default ToolbarSelectionStatus;
