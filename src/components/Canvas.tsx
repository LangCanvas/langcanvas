
import React, { useRef, useEffect } from 'react';
import { EnhancedNode, NodeType } from '../types/nodeTypes';
import { Edge } from '../hooks/useEdges';
import { useNodeCreation } from '../hooks/useNodeCreation';
import { useMobileDetection } from '../hooks/useMobileDetection';
import { useEnhancedAnalytics } from '../hooks/useEnhancedAnalytics';
import { ScrollArea } from '@/components/ui/scroll-area';
import DragDropHandler from './canvas/DragDropHandler';
import EdgeCreationHandler from './canvas/EdgeCreationHandler';
import CanvasBackground from './canvas/CanvasBackground';
import EdgePreview from './canvas/EdgePreview';
import KeyboardHandler from './canvas/KeyboardHandler';
import NodeComponent from './Node';
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobileDetection();
  const analytics = useEnhancedAnalytics();
  
  const { createNode } = useNodeCreation({ onAddNode });

  // Enhanced createNode with analytics tracking
  const createNodeWithAnalytics = (type: NodeType, x: number, y: number) => {
    const result = createNode(type, x, y);
    
    // Track node creation
    if (result) {
      analytics.trackNodeCreated(type);
      analytics.trackFeatureUsage('node_created_on_canvas', { 
        nodeType: type, 
        position: { x, y },
        method: 'canvas_click'
      });
    }
    
    return result;
  };

  // Enhanced move handler with analytics
  const handleMoveNode = (id: string, x: number, y: number) => {
    onMoveNode(id, x, y);
    
    // Track node movement (throttled to avoid too many events)
    if (analytics.isEnabled) {
      const node = nodes.find(n => n.id === id);
      analytics.trackFeatureUsage('node_moved', { 
        nodeId: id, 
        nodeType: node?.type,
        newPosition: { x, y }
      });
    }
  };

  // Clear selection helper function
  const clearAllSelections = () => {
    console.log('🔄 Clearing all selections');
    onSelectNode(null);
    onSelectEdge(null);
    
    // Track selection clearing
    analytics.trackFeatureUsage('selections_cleared');
  };

  // Safe node selection that clears edge selection
  const selectNodeSafely = (nodeId: string | null) => {
    console.log(`🎯 Selecting node: ${nodeId}, clearing edge selection`);
    onSelectEdge(null); // Clear edge selection first
    onSelectNode(nodeId);
  };

  // Safe edge selection that clears node selection
  const selectEdgeSafely = (edgeId: string | null) => {
    console.log(`🔗 Selecting edge: ${edgeId}, clearing node selection`);
    onSelectNode(null); // Clear node selection first
    onSelectEdge(edgeId);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Don't handle clicks on SVG elements (edges) - they have their own handlers
      if (target.tagName === 'line' || target.tagName === 'svg' || target.closest('svg')) {
        console.log('🚫 Canvas ignoring SVG click - handled by EdgeRenderer');
        return;
      }
      
      // Check if we're trying to place a node (mobile)
      const nodeType = (pendingNodeType || canvas.getAttribute('data-node-type')) as NodeType;
      
      if (nodeType && (target === canvas || target.closest('.canvas-background'))) {
        event.preventDefault();
        event.stopPropagation();
        
        const rect = canvas.getBoundingClientRect();
        const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        const scrollLeft = scrollContainer?.scrollLeft || 0;
        const scrollTop = scrollContainer?.scrollTop || 0;
        
        const x = event.clientX - rect.left + scrollLeft;
        const y = event.clientY - rect.top + scrollTop;
        
        console.log(`🎯 Canvas click: placing ${nodeType} at (${x}, ${y})`);
        
        const result = createNodeWithAnalytics(nodeType, x, y);
        
        if (result && onClearPendingCreation) {
          onClearPendingCreation();
        }
        
        return;
      }
      
      // Regular selection logic - only if no pending node creation and not clicking on nodes
      if (!nodeType && (target === canvas || target.closest('.canvas-background'))) {
        console.log('🎯 Canvas click: clearing all selections');
        clearAllSelections();
      }
    };

    canvas.addEventListener('click', handleClick, { capture: true });
    return () => canvas.removeEventListener('click', handleClick, { capture: true });
  }, [onSelectNode, onSelectEdge, createNodeWithAnalytics, pendingNodeType, onClearPendingCreation, analytics]);

  // Debug logging for selection state changes
  useEffect(() => {
    console.log(`📊 Canvas selection state - Node: ${selectedNodeId}, Edge: ${selectedEdgeId}`);
  }, [selectedNodeId, selectedEdgeId]);

  return (
    <ScrollArea ref={scrollAreaRef} className="w-full h-full">
      <DragDropHandler onAddNode={createNodeWithAnalytics}>
        <div
          ref={canvasRef}
          id="canvas"
          className={`relative transition-colors ${className} ${
            isMobile ? 'touch-pan-y' : ''
          } ${pendingNodeType ? 'cursor-crosshair' : ''}`}
          style={{
            width: '3000px',
            height: '3000px',
            minWidth: '100vw',
            minHeight: '100vh',
            touchAction: 'manipulation',
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
                <CanvasBackground 
                  isDragOver={false} 
                  isMobile={isMobile} 
                  nodeCount={nodes.length} 
                />

                {/* Edge Renderer */}
                <EdgeRenderer
                  edges={edges}
                  nodes={nodes}
                  selectedEdgeId={selectedEdgeId}
                  onSelectEdge={selectEdgeSafely}
                  getEdgeValidationClass={getEdgeValidationClass}
                  getEdgeTooltip={getEdgeTooltip}
                />

                {/* Edge Preview while creating */}
                <EdgePreview edgePreview={edgePreview} />

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
                    <NodeComponent
                      node={node}
                      isSelected={selectedNodeId === node.id}
                      canCreateEdge={canCreateEdge(node)}
                      onSelect={selectNodeSafely}
                      onMove={handleMoveNode}
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
    </ScrollArea>
  );
};

export default Canvas;
