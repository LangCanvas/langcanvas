
import React, { useRef, useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { NodeType } from './NodePalette';
import { Node as NodeData } from '../hooks/useNodes';
import NodeComponent from './Node';

interface CanvasProps {
  className?: string;
  nodes: NodeData[];
  selectedNodeId: string | null;
  onAddNode: (type: NodeData['type'], x: number, y: number) => NodeData | null;
  onSelectNode: (id: string | null) => void;
  onMoveNode: (id: string, x: number, y: number) => void;
  onDeleteNode: (id: string) => void;
}

const Canvas: React.FC<CanvasProps> = ({ 
  className, 
  nodes, 
  selectedNodeId, 
  onAddNode, 
  onSelectNode, 
  onMoveNode,
  onDeleteNode 
}) => {
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
        const x = event.clientX - rect.left - 60; // Center the node on cursor
        const y = event.clientY - rect.top - 30;
        
        console.log(`Creating ${nodeType.name} node at (${x}, ${y})`);
        onAddNode(nodeType.id as NodeData['type'], Math.max(0, x), Math.max(0, y));
      }
    };

    const handleClick = (event: MouseEvent) => {
      // If clicking on the canvas background (not on a node), deselect
      const target = event.target as HTMLElement;
      if (target === canvas || target.closest('.canvas-background')) {
        onSelectNode(null);
      }
    };

    canvas.addEventListener('dragover', handleDragOver);
    canvas.addEventListener('dragleave', handleDragLeave);
    canvas.addEventListener('drop', handleDrop);
    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('dragover', handleDragOver);
      canvas.removeEventListener('dragleave', handleDragLeave);
      canvas.removeEventListener('drop', handleDrop);
      canvas.removeEventListener('click', handleClick);
    };
  }, [onAddNode, onSelectNode]);

  // Handle keyboard events for deletion
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' && selectedNodeId) {
        event.preventDefault();
        onDeleteNode(selectedNodeId);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, onDeleteNode]);

  return (
    <div
      ref={canvasRef}
      id="canvas"
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
      <div className="canvas-background absolute inset-0">
        {isDragOver && (
          <div className="absolute inset-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50/50 flex items-center justify-center">
            <p className="text-blue-600 font-medium">Drop node here</p>
          </div>
        )}
        
        {!isDragOver && nodes.length === 0 && (
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

      {/* Render all nodes */}
      {nodes.map((node) => (
        <NodeComponent
          key={node.id}
          node={node}
          isSelected={selectedNodeId === node.id}
          onSelect={onSelectNode}
          onMove={onMoveNode}
        />
      ))}
    </div>
  );
};

export default Canvas;
