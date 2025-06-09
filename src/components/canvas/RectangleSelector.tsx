
import React from 'react';
import { SelectionRectangle } from '../../hooks/useMultiSelection';

interface RectangleSelectorProps {
  selectionRect: SelectionRectangle | null;
  isSelecting: boolean;
}

const RectangleSelector: React.FC<RectangleSelectorProps> = ({
  selectionRect,
  isSelecting
}) => {
  if (!isSelecting || !selectionRect) {
    return null;
  }

  const left = Math.min(selectionRect.startX, selectionRect.endX);
  const top = Math.min(selectionRect.startY, selectionRect.endY);
  const width = Math.abs(selectionRect.endX - selectionRect.startX);
  const height = Math.abs(selectionRect.endY - selectionRect.startY);

  return (
    <div
      className="absolute border-2 border-blue-500 border-dashed bg-blue-100 bg-opacity-20 pointer-events-none"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex: 1000, // High z-index to ensure visibility
      }}
    />
  );
};

export default RectangleSelector;
