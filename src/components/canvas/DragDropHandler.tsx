
import React, { useRef, useEffect, useState } from 'react';
import { NodeType } from '../NodePalette';
import { Node as NodeData } from '../../hooks/useNodes';

interface DragDropHandlerProps {
  onAddNode: (type: NodeData['type'], x: number, y: number) => NodeData | null;
  children: React.ReactNode;
}

const DragDropHandler: React.FC<DragDropHandlerProps> = ({ onAddNode, children }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleDragOver = (event: DragEvent) => {
      event.preventDefault();
      setIsDragOver(true);
    };

    const handleDragLeave = (event: DragEvent) => {
      if (!canvas.contains(event.relatedTarget as Node)) {
        setIsDragOver(false);
      }
    };

    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      setIsDragOver(false);
      
      const data = event.dataTransfer?.getData('application/json');
      if (data) {
        const nodeType: NodeType = JSON.parse(data);
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left - 60;
        const y = event.clientY - rect.top - 30;
        
        console.log(`Creating ${nodeType.name} node at (${x}, ${y})`);
        onAddNode(nodeType.id as NodeData['type'], Math.max(0, x), Math.max(0, y));
      }
    };

    canvas.addEventListener('dragover', handleDragOver);
    canvas.addEventListener('dragleave', handleDragLeave);
    canvas.addEventListener('drop', handleDrop);

    return () => {
      canvas.removeEventListener('dragover', handleDragOver);
      canvas.removeEventListener('dragleave', handleDragLeave);
      canvas.removeEventListener('drop', handleDrop);
    };
  }, [onAddNode]);

  return (
    <div ref={canvasRef} className="w-full h-full">
      {React.cloneElement(children as React.ReactElement, { isDragOver })}
    </div>
  );
};

export default DragDropHandler;
