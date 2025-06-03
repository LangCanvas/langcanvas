
import React, { useRef, useEffect } from 'react';
import { Node as NodeData } from '../hooks/useNodes';
import { Edge } from '../hooks/useEdges';
import { useMobileDetection } from '../hooks/useMobileDetection';
import DragDropHandler from './canvas/DragDropHandler';
import EdgeCreationHandler from './canvas/EdgeCreationHandler';
import CanvasBackground from './canvas/CanvasBackground';
import EdgePreview from './canvas/EdgePreview';
import KeyboardHandler from './canvas/KeyboardHandler';
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
  getNodeValidationClass?: (nodeId: string) => string;
  getEdgeValidationClass?: (edgeId: string) => string;
  getNodeTooltip?: (nodeId: string) => string;
  getEdgeTooltip?: (edgeId: string) => string;
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
  canCreateEdge,
  getNodeValidationClass,
  getEdgeValidationClass,
  getNodeTooltip,
  getEdgeTooltip
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobileDetection();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check if we're trying to place a node (mobile)
      const nodeType = canvas.getAttribute('data-node-type') as NodeData['type'];
      if (nodeType && (target === canvas || target.closest('.canvas-background'))) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        onAddNode(nodeType, x, y);
        canvas.removeAttribute('data-node-type');
        
        // Remove any instruction messages
        const instructions = document.querySelectorAll('.fixed.bg-blue-100');
        instructions.forEach(inst => {
          if (document.body.contains(inst)) {
            document.body.removeChild(inst);
          }
        });
        return;
      }
      
      // Regular selection logic
      if (target === canvas || target.closest('.canvas-background')) {
        onSelectNode(null);
        onSelectEdge(null);
      }
    };

    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, [onSelectNode, onSelectEdge, onAddNode]);

  return (
    <DragDropHandler onAddNode={onAddNode}>
      <div
        ref={canvasRef}
        id="canvas"
        className={`w-full h-full relative transition-colors ${className} ${
          isMobile ? 'touch-pan-y' : ''
        }`}
        style={{
          touchAction: 'pan-x pan-y',
        }}
      >
        <KeyboardHandler
          selectedNodeId={selectedNodeId}
          selectedEdgeId={selectedEdgeId}
          onDeleteNode={onDeleteNode}
          onDeleteEdge={onDeleteEdge}
        />

        <EdgeCreationHandler
          nodes={nodes}
          onAddEdge={onAddEdge}
          canvasRef={canvasRef}
        >
          {({ isCreatingEdge, edgePreview, hoveredNodeId, handleStartConnection }) => (
            <>
              {/* Edge Renderer */}
              <EdgeRenderer
                edges={edges}
                nodes={nodes}
                selectedEdgeId={selectedEdgeId}
                onSelectEdge={onSelectEdge}
                getEdgeValidationClass={getEdgeValidationClass}
                getEdgeTooltip={getEdgeTooltip}
              />

              {/* Edge Preview while creating */}
              <EdgePreview edgePreview={edgePreview} />

              <CanvasBackground 
                isDragOver={false} 
                isMobile={isMobile} 
                nodeCount={nodes.length} 
              />

              {/* Mobile connection instructions */}
              {isMobile && isCreatingEdge && (
                <div className="absolute top-4 left-4 right-4 bg-blue-100 border border-blue-300 rounded-lg p-3 text-blue-800 text-sm z-20">
                  Drag to another node to create a connection
                </div>
              )}

              {/* Render all nodes */}
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className={`${hoveredNodeId === node.id ? 'ring-2 ring-blue-400 ring-opacity-50 rounded-lg' : ''} ${
                    isMobile ? 'touch-manipulation' : ''
                  }`}
                >
                  <NodeComponent
                    node={node}
                    isSelected={selectedNodeId === node.id}
                    canCreateEdge={canCreateEdge(node)}
                    onSelect={onSelectNode}
                    onMove={onMoveNode}
                    onStartConnection={handleStartConnection}
                    validationClass={getNodeValidationClass?.(node.id) || ''}
                    validationTooltip={getNodeTooltip?.(node.id) || ''}
                  />
                </div>
              ))}
            </>
          )}
        </EdgeCreationHandler>
      </div>
    </DragDropHandler>
  );
};

export default Canvas;
