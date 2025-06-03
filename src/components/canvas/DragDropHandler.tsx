
import React, { useState, useRef } from 'react';
import { Node } from '../../hooks/useNodes';

interface DragDropHandlerProps {
  children: React.ReactNode;
  onAddNode: (type: Node['type'], x: number, y: number) => Node | null;
}

const DragDropHandler: React.FC<DragDropHandlerProps> = ({ children, onAddNode }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const lastDropTimeRef = useRef<number>(0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!dropZoneRef.current?.contains(e.relatedTarget as HTMLElement)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const now = Date.now();
    const timeSinceLastDrop = now - lastDropTimeRef.current;
    
    // Prevent rapid successive drops
    if (timeSinceLastDrop < 200) {
      console.log('🚫 Drop blocked: too rapid');
      return;
    }
    
    const nodeType = e.dataTransfer.getData('text/plain') as Node['type'];
    if (!nodeType) {
      console.log('🚫 Drop blocked: no node type');
      return;
    }

    const rect = dropZoneRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      console.log(`🎯 Drag & Drop: ${nodeType} at (${x}, ${y})`);
      
      const result = onAddNode(nodeType, x, y);
      if (result) {
        lastDropTimeRef.current = now;
      }
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
