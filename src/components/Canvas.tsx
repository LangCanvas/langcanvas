import React, { useRef, useEffect, useState } from 'react';
import { EnhancedNode, NodeType } from '../types/nodeTypes';
import { EnhancedEdge } from '../types/edgeTypes';
import { useNodeCreation } from '../hooks/useNodeCreation';
import { useMobileDetection } from '../hooks/useMobileDetection';
import { useEnhancedAnalytics } from '../hooks/useEnhancedAnalytics';
import { useCanvasHandlers } from '../hooks/useCanvasHandlers';
import { useMultiSelection } from '../hooks/useMultiSelection';
import { useMultiNodeDrag } from '../hooks/useMultiNodeDrag';
import { ScrollArea } from '@/components/ui/scroll-area';
import DragDropHandler from './canvas/DragDropHandler';
import EdgeCreationHandler from './canvas/EdgeCreationHandler';
import CanvasBackground from './canvas/CanvasBackground';
import EdgePreview from './canvas/EdgePreview';
import KeyboardHandler from './canvas/KeyboardHandler';
import RectangleSelector from './canvas/RectangleSelector';
import NodeComponent from './Node';
import ConditionalNodeComponent from './ConditionalNodeComponent';
import EnhancedEdgeRenderer from './EnhancedEdgeRenderer';

interface CanvasProps {
  className?: string;
  nodes: EnhancedNode[];
  edges: EnhancedEdge[];
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

  // Multi-selection state
  const {
    selectedNodeIds,
    isSelecting,
    selectionRect,
    selectSingleNode,
    toggleNodeSelection,
    clearSelection,
    startRectangleSelection,
    updateRectangleSelection,
    endRectangleSelection,
  } = useMultiSelection();

  // Multi-node dragging
  const {
    isDragging: isMultiDragging,
    startDrag: startMultiDrag,
    updateDrag: updateMultiDrag,
    endDrag: endMultiDrag,
  } = useMultiNodeDrag(selectedNodeIds, nodes, onMoveNode);

  // Enhanced createNode with analytics tracking
  const createNodeWithAnalytics = (type: NodeType, x: number, y: number) => {
    const result = createNode(type, x, y);
    
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

  const {
    selectNodeSafely,
    selectEdgeSafely,
    handleMoveNode,
  } = useCanvasHandlers({
    canvasRef,
    scrollAreaRef,
    onSelectNode,
    onSelectEdge,
    createNodeWithAnalytics,
    pendingNodeType,
    onClearPendingCreation,
    onMoveNode,
    nodes,
  });

  // Handle mouse events for rectangle selection
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Don't start selection if clicking on nodes, edges, or UI elements
      if (target.closest('.node') || target.closest('svg') || target.closest('.connection-handle')) {
        return;
      }

      // Don't start selection if placing a node
      if (pendingNodeType) {
        return;
      }

      // Start rectangle selection if clicking on canvas background (removed Shift requirement)
      if (target === canvas || target.closest('.canvas-background')) {
        event.preventDefault();
        
        const rect = canvas.getBoundingClientRect();
        const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        const scrollLeft = scrollContainer?.scrollLeft || 0;
        const scrollTop = scrollContainer?.scrollTop || 0;
        
        const x = event.clientX - rect.left + scrollLeft;
        const y = event.clientY - rect.top + scrollTop;
        
        console.log('🔲 Starting rectangle selection at:', { x, y });
        startRectangleSelection(x, y);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isSelecting) {
        const rect = canvas.getBoundingClientRect();
        const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        const scrollLeft = scrollContainer?.scrollLeft || 0;
        const scrollTop = scrollContainer?.scrollTop || 0;
        
        const x = event.clientX - rect.left + scrollLeft;
        const y = event.clientY - rect.top + scrollTop;
        
        updateRectangleSelection(x, y);
      }
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (isSelecting) {
        console.log('🔲 Ending rectangle selection');
        endRectangleSelection(nodes);
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSelecting, pendingNodeType, nodes, startRectangleSelection, updateRectangleSelection, endRectangleSelection]);

  // Handle global mouse events for multi-node dragging
  useEffect(() => {
    if (!isMultiDragging) return;

    const handleMouseMove = (event: MouseEvent) => {
      updateMultiDrag(event.clientX, event.clientY);
    };

    const handleMouseUp = () => {
      endMultiDrag();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isMultiDragging, updateMultiDrag, endMultiDrag]);

  // Sync single selection with multi-selection
  useEffect(() => {
    if (selectedNodeId && !selectedNodeIds.includes(selectedNodeId)) {
      selectSingleNode(selectedNodeId);
    } else if (!selectedNodeId && selectedNodeIds.length > 0) {
      clearSelection();
    }
  }, [selectedNodeId, selectedNodeIds, selectSingleNode, clearSelection]);

  // Debug logging for selection state changes
  useEffect(() => {
    console.log(`📊 Canvas selection state - Node: ${selectedNodeId}, Edge: ${selectedEdgeId}, Multi: [${selectedNodeIds.join(', ')}], Selecting: ${isSelecting}`);
  }, [selectedNodeId, selectedEdgeId, selectedNodeIds, isSelecting]);

  const handleNodeSelect = (nodeId: string, event?: React.MouseEvent) => {
    const isCtrlPressed = event?.ctrlKey || event?.metaKey || false;
    
    if (selectedNodeIds.length > 1 || isCtrlPressed) {
      toggleNodeSelection(nodeId, isCtrlPressed);
      if (!isCtrlPressed) {
        selectNodeSafely(nodeId);
      }
    } else {
      selectNodeSafely(nodeId);
      selectSingleNode(nodeId);
    }
  };

  const handleNodeDoubleClick = (nodeId: string) => {
    // Dispatch custom event to open right panel
    window.dispatchEvent(new CustomEvent('openPropertiesPanel', { 
      detail: { nodeId, type: 'node' } 
    }));
  };

  const handleEdgeDoubleClick = (edgeId: string) => {
    // Dispatch custom event to open right panel  
    window.dispatchEvent(new CustomEvent('openPropertiesPanel', { 
      detail: { edgeId, type: 'edge' } 
    }));
  };

  const handleNodeDragStart = (nodeId: string, event: React.MouseEvent) => {
    if (selectedNodeIds.includes(nodeId) && selectedNodeIds.length > 1) {
      startMultiDrag(nodeId, event.clientX, event.clientY);
    }
  };

  return (
    <ScrollArea ref={scrollAreaRef} className="w-full h-full">
      <DragDropHandler onAddNode={createNodeWithAnalytics}>
        <div
          ref={canvasRef}
          id="canvas"
          className={`relative transition-colors ${className} ${
            isMobile ? 'touch-pan-y' : ''
          } ${pendingNodeType ? 'cursor-crosshair' : ''} ${
            isSelecting ? 'cursor-crosshair' : ''
          }`}
          style={{
            width: '3000px',
            height: '3000px',
            minWidth: '100vw',
            minHeight: '100vh',
            paddingRight: '20px', // Space for scrollbar
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

                {/* Enhanced Edge Renderer */}
                <EnhancedEdgeRenderer
                  edges={edges}
                  nodes={nodes}
                  selectedEdgeId={selectedEdgeId}
                  onSelectEdge={selectEdgeSafely}
                  onDoubleClick={handleEdgeDoubleClick}
                  getEdgeValidationClass={getEdgeValidationClass}
                  getEdgeTooltip={getEdgeTooltip}
                />

                {/* Rectangle Selection */}
                <RectangleSelector
                  selectionRect={selectionRect}
                  isSelecting={isSelecting}
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

                {/* Rectangle selection instruction */}
                {isSelecting && (
                  <div className="absolute top-4 left-4 right-4 bg-purple-100 border border-purple-300 rounded-lg p-3 text-purple-800 text-sm z-20">
                    Drag to select multiple nodes
                  </div>
                )}

                {/* Render all nodes */}
                {nodes.map((node) => {
                  const isSelected = selectedNodeIds.includes(node.id);
                  const isHovered = hoveredNodeId === node.id;
                  
                  return (
                    <div
                      key={node.id}
                      className={`${isHovered ? 'ring-2 ring-blue-400 ring-opacity-50 rounded-lg' : ''} ${
                        isMobile ? 'touch-manipulation' : ''
                      }`}
                    >
                      {node.type === 'conditional' ? (
                        <ConditionalNodeComponent
                          node={node}
                          outgoingEdges={edges.filter(e => e.source === node.id)}
                          isSelected={isSelected}
                          canCreateEdge={canCreateEdge(node)}
                          onSelect={(id) => handleNodeSelect(id)}
                          onDoubleClick={() => handleNodeDoubleClick(node.id)}
                          onMove={handleMoveNode}
                          onDragStart={(event) => handleNodeDragStart(node.id, event)}
                          onStartConnection={handleStartConnection}
                          validationClass={getNodeValidationClass?.(node.id) || ''}
                          validationTooltip={getNodeTooltip?.(node.id) || ''}
                        />
                      ) : (
                        <NodeComponent
                          node={node}
                          isSelected={isSelected}
                          canCreateEdge={canCreateEdge(node)}
                          onSelect={(id) => handleNodeSelect(id)}
                          onDoubleClick={() => handleNodeDoubleClick(node.id)}
                          onMove={handleMoveNode}
                          onDragStart={(event) => handleNodeDragStart(node.id, event)}
                          onStartConnection={handleStartConnection}
                          validationClass={getNodeValidationClass?.(node.id) || ''}
                          validationTooltip={getNodeTooltip?.(node.id) || ''}
                        />
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </EdgeCreationHandler>
        </div>
      </DragDropHandler>
    </ScrollArea>
  );
};

export default Canvas;
