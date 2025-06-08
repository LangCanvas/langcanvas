
import React, { useState, useRef } from 'react';
import { EnhancedNode, NodeType } from '../../types/nodeTypes';
import { useEnhancedAnalytics } from '../../hooks/useEnhancedAnalytics';

interface DragDropHandlerProps {
  children: React.ReactNode;
  onAddNode: (type: NodeType, x: number, y: number) => EnhancedNode | null;
}

const DragDropHandler: React.FC<DragDropHandlerProps> = ({ children, onAddNode }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const lastDropTimeRef = useRef<number>(0);
  const analytics = useEnhancedAnalytics();

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
    
    const nodeType = e.dataTransfer.getData('text/plain') as NodeType;
    if (!nodeType) {
      console.log('🚫 Drop blocked: no node type');
      return;
    }

    // Get the stored offset from drag data
    const offsetData = e.dataTransfer.getData('application/offset');
    let dragOffset = { x: 0, y: 0 };
    
    if (offsetData) {
      try {
        dragOffset = JSON.parse(offsetData);
      } catch (error) {
        console.warn('Failed to parse drag offset data:', error);
        // Fallback to default offsets based on node type
        if (nodeType === 'conditional') {
          dragOffset = { x: 40, y: 40 }; // Half of 80x80
        } else {
          dragOffset = { x: 60, y: 30 }; // Half of 120x60
        }
      }
    }

    const rect = dropZoneRef.current?.getBoundingClientRect();
    if (rect) {
      // Get scroll information
      const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
      const scrollLeft = scrollContainer?.scrollLeft || 0;
      const scrollTop = scrollContainer?.scrollTop || 0;
      
      // Calculate position accounting for drag offset and scroll
      const x = e.clientX - rect.left + scrollLeft - dragOffset.x;
      const y = e.clientY - rect.top + scrollTop - dragOffset.y;
      
      console.log(`🎯 Drag & Drop: ${nodeType} at (${x}, ${y}) with offset (${dragOffset.x}, ${dragOffset.y})`);
      
      const result = onAddNode(nodeType, x, y);
      if (result) {
        lastDropTimeRef.current = now;
        
        // Track drag and drop node creation
        analytics.trackNodeCreated(nodeType);
        analytics.trackFeatureUsage('node_created_drag_drop', {
          nodeType,
          position: { x, y },
          method: 'drag_and_drop'
        });
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
