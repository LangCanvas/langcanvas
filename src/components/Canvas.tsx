
import React, { useRef, useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { NodeType } from './NodePalette';
import { Node as NodeData } from '../hooks/useNodes';
import { Edge } from '../hooks/useEdges';
import { useToast } from '@/hooks/use-toast';
import NodeComponent from './Node';
import EdgeRenderer from './EdgeRenderer';

interface CanvasProps {
  className?: string;
  nodes: NodeData[];
  edges: Edge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  onAddNode: (type: NodeData['type'], x: number, y: number) => NodeData | null;
  onSelectNode: (id: string | null) => void;
  onSelectEdge: (id: string | null) => void;
  onMoveNode: (id: string, x: number, y: number) => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  onAddEdge: (sourceNode: NodeData, targetNode: NodeData) => { success: boolean; error?: string };
  canCreateEdge: (sourceNode: NodeData) => boolean;
}

const Canvas: React.FC<CanvasProps> = ({ 
  className, 
  nodes, 
  edges,
  selectedNodeId, 
  selectedEdgeId,
  onAddNode, 
  onSelectNode, 
  onSelectEdge,
  onMoveNode,
  onDeleteNode,
  onDeleteEdge,
  onAddEdge,
  canCreateEdge
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCreatingEdge, setIsCreatingEdge] = useState(false);
  const [edgePreview, setEdgePreview] = useState<{ startX: number; startY: number; endX: number; endY: number; sourceNode: NodeData } | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const { toast } = useToast();

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

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target === canvas || target.closest('.canvas-background')) {
        onSelectNode(null);
        onSelectEdge(null);
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
  }, [onAddNode, onSelectNode, onSelectEdge]);

  // Handle keyboard events for deletion
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete') {
        event.preventDefault();
        if (selectedNodeId) {
          onDeleteNode(selectedNodeId);
        } else if (selectedEdgeId) {
          onDeleteEdge(selectedEdgeId);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, selectedEdgeId, onDeleteNode, onDeleteEdge]);

  // Handle edge creation
  const handleStartConnection = (sourceNode: NodeData, startX: number, startY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    const relativeStartX = startX - canvasRect.left;
    const relativeStartY = startY - canvasRect.top;

    setIsCreatingEdge(true);
    setEdgePreview({
      startX: relativeStartX,
      startY: relativeStartY,
      endX: relativeStartX,
      endY: relativeStartY,
      sourceNode
    });

    const handleMouseMove = (e: MouseEvent) => {
      const newEndX = e.clientX - canvasRect.left;
      const newEndY = e.clientY - canvasRect.top;
      
      setEdgePreview(prev => prev ? {
        ...prev,
        endX: newEndX,
        endY: newEndY
      } : null);

      // Check if hovering over a node
      const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
      const nodeElement = elementUnderCursor?.closest('[data-node-id]') as HTMLElement;
      
      if (nodeElement) {
        const nodeId = nodeElement.getAttribute('data-node-id');
        setHoveredNodeId(nodeId);
      } else {
        setHoveredNodeId(null);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
      const nodeElement = elementUnderCursor?.closest('[data-node-id]') as HTMLElement;
      
      if (nodeElement) {
        const targetNodeId = nodeElement.getAttribute('data-node-id');
        const targetNode = nodes.find(n => n.id === targetNodeId);
        
        if (targetNode && targetNode.id !== sourceNode.id) {
          const result = onAddEdge(sourceNode, targetNode);
          if (!result.success && result.error) {
            toast({
              title: "Connection Failed",
              description: result.error,
              variant: "destructive",
            });
          }
        }
      }

      // Cleanup
      setIsCreatingEdge(false);
      setEdgePreview(null);
      setHoveredNodeId(null);
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

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
      {/* Edge Renderer */}
      <EdgeRenderer
        edges={edges}
        nodes={nodes}
        selectedEdgeId={selectedEdgeId}
        onSelectEdge={onSelectEdge}
      />

      {/* Edge Preview while creating */}
      {edgePreview && (
        <svg className="absolute inset-0 pointer-events-none z-10" style={{ width: '100%', height: '100%' }}>
          <defs>
            <marker
              id="arrowhead-preview"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
            </marker>
          </defs>
          <line
            x1={edgePreview.startX}
            y1={edgePreview.startY}
            x2={edgePreview.endX}
            y2={edgePreview.endY}
            stroke="#6b7280"
            strokeWidth="2"
            strokeDasharray="5,5"
            markerEnd="url(#arrowhead-preview)"
          />
        </svg>
      )}

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
        <div
          key={node.id}
          className={hoveredNodeId === node.id ? 'ring-2 ring-blue-400 ring-opacity-50 rounded-lg' : ''}
        >
          <NodeComponent
            node={node}
            isSelected={selectedNodeId === node.id}
            canCreateEdge={canCreateEdge(node)}
            onSelect={onSelectNode}
            onMove={onMoveNode}
            onStartConnection={handleStartConnection}
          />
        </div>
      ))}
    </div>
  );
};

export default Canvas;
