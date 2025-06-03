
import React, { useRef, useEffect, useState } from 'react';
import { Menu } from 'lucide-react';

interface CanvasProps {
  className?: string;
}

const Canvas: React.FC<CanvasProps> = ({ className }) => {
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
        const nodeType = JSON.parse(data);
        console.log('Dropped node:', nodeType);
        // Future implementation: Create node at drop position
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
  }, []);

  return (
    <div
      ref={canvasRef}
      className={`w-full h-full relative transition-colors ${
        isDragOver ? 'bg-blue-50' : 'bg-gradient-to-br from-gray-50 to-gray-100'
      } ${className}`}
      style={{
        backgroundImage: isDragOver 
          ? 'radial-gradient(circle, #dbeafe 1px, transparent 1px)'
          : 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}
    >
      {isDragOver && (
        <div className="absolute inset-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50/50 flex items-center justify-center">
          <p className="text-blue-600 font-medium">Drop node here</p>
        </div>
      )}
      
      {!isDragOver && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="mb-2">
              <Menu className="w-12 h-12 mx-auto mb-4 opacity-30" />
            </div>
            <p className="text-lg font-medium mb-1">Welcome to LangCanvas</p>
            <p className="text-sm">Drag nodes from the palette to start building your graph</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Canvas;
