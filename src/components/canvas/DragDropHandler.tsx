
import React, { useState, useRef } from 'react';
import { Node } from '../../hooks/useNodes';

interface DragDropHandlerProps {
  children: React.ReactNode;
  onAddNode: (type: Node['type'], x: number, y: number) => Node | null;
}

const DragDropHandler: React.FC<DragDropHandlerProps> = ({ children, onAddNode }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const nodeType = e.dataTransfer.getData('text/plain') as Node['type'];
    if (!nodeType) return;

    const rect = dropZoneRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      onAddNode(nodeType, x, y);
    }
  };

  return (
    <div
      ref={dropZoneRef}
      className={`w-full h-full ${isDragOver ? 'bg-blue-50' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
    </div>
  );
};

export default DragDropHandler;
