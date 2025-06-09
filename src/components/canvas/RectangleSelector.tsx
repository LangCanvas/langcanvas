
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
  // Only render if we have a valid rectangle and are actively selecting
  if (!isSelecting || !selectionRect) {
    return null;
  }

  const left = Math.min(selectionRect.startX, selectionRect.endX);
  const top = Math.min(selectionRect.startY, selectionRect.endY);
  const width = Math.abs(selectionRect.endX - selectionRect.startX);
  const height = Math.abs(selectionRect.endY - selectionRect.startY);

  // Additional safety check - don't render very small rectangles
  if (width < 10 && height < 10) {
    return null;
  }

  return (
    <div
      className="absolute border-2 border-blue-500 border-dashed bg-blue-100 bg-opacity-30 pointer-events-none"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex: 1000,
        boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.5)',
      }}
    />
  );
};

export default RectangleSelector;
