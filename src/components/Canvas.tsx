
import React, { useRef, useEffect } from 'react';
import { EnhancedNode, NodeType } from '../types/nodeTypes';
import { Edge } from '../hooks/useEdges';
import { useNodeCreation } from '../hooks/useNodeCreation';
import { useMobileDetection } from '../hooks/useMobileDetection';
import DragDropHandler from './canvas/DragDropHandler';
import EdgeCreationHandler from './canvas/EdgeCreationHandler';
import CanvasBackground from './canvas/CanvasBackground';
import EdgePreview from './canvas/EdgePreview';
import KeyboardHandler from './canvas/KeyboardHandler';
import EnhancedNodeComponent from './EnhancedNodeComponent';
import EdgeRenderer from './EdgeRenderer';

interface CanvasProps {
  className?: string;
  nodes: EnhancedNode[];
  edges: Edge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  onAddNode: (type: NodeType, x: number, y: number) => EnhancedNode | null;
  onSelectNode: (id: string | null) => void;
  onSelectEdge: (id: string | null) => void;
  onMoveNode: (id: string, x: number, y: number) => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  onAddEdge: (sourceNode: EnhancedNode, targetNode: EnhancedNode) => { success: boolean; error?: string };
  canCreateEdge: (sourceNode: EnhancedNode) => boolean;
  getNodeValidationClass?: (nodeId: string) => string;
  getEdgeValidationClass?: (edgeId: string) => string;
  getNodeTooltip?: (nodeId: string) => string;
  getEdgeTooltip?: (edgeId: string) => string;
  pendingNodeType?: NodeType | null;
  onClearPendingCreation?: () => void;
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
  getEdgeTooltip,
  pendingNodeType,
  onClearPendingCreation
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobileDetection();
  
  const { createNode } = useNodeCreation({ onAddNode });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check if we're trying to place a node (mobile)
      const nodeType = (pendingNodeType || canvas.getAttribute('data-node-type')) as NodeType;
      
      if (nodeType && (target === canvas || target.closest('.canvas-background'))) {
        event.preventDefault();
        event.stopPropagation();
        
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        console.log(`🎯 Canvas click: placing ${nodeType} at (${x}, ${y})`);
        
        const result = createNode(nodeType, x, y);
        
        if (result && onClearPendingCreation) {
          onClearPendingCreation();
        }
        
        return;
      }
      
      // Regular selection logic - only if no pending node creation
      if (!nodeType && (target === canvas || target.closest('.canvas-background'))) {
        onSelectNode(null);
        onSelectEdge(null);
      }
    };

    canvas.addEventListener('click', handleClick, { capture: true });
    return () => canvas.removeEventListener('click', handleClick, { capture: true });
  }, [onSelectNode, onSelectEdge, createNode, pendingNodeType, onClearPendingCreation]);

  return (
    <DragDropHandler onAddNode={createNode}>
      <div
        ref={canvasRef}
        id="canvas"
        className={`w-full h-full relative transition-colors ${className} ${
          isMobile ? 'touch-pan-y' : ''
        } ${pendingNodeType ? 'cursor-crosshair' : ''}`}
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

              {/* Pending node creation instruction */}
              {pendingNodeType && (
                <div className="absolute top-4 left-4 right-4 bg-green-100 border border-green-300 rounded-lg p-3 text-green-800 text-sm z-20">
                  Click on the canvas to place the {pendingNodeType} node
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
                  <EnhancedNodeComponent
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
