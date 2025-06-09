import React, { useRef, useEffect, useState } from 'react';
import { EnhancedNode, NodeType } from '../types/nodeTypes';
import { EnhancedEdge } from '../types/edgeTypes';
import { useNodeCreation } from '../hooks/useNodeCreation';
import { useMobileDetection } from '../hooks/useMobileDetection';
import { useEnhancedAnalytics } from '../hooks/useEnhancedAnalytics';
import { useCanvasHandlers } from '../hooks/useCanvasHandlers';
import { useMultiSelection } from '../hooks/useMultiSelection';
import { useMultiNodeDrag } from '../hooks/useMultiNodeDrag';
import { getCanvasCoordinates } from '../utils/canvasCoordinates';
import { ScrollArea } from '@/components/ui/scroll-area';
import DragDropHandler from './canvas/DragDropHandler';
import EdgeCreationHandler from './canvas/EdgeCreationHandler';
import CanvasBackground from './canvas/CanvasBackground';
import EdgePreview from './canvas/EdgePreview';
import KeyboardHandler from './canvas/KeyboardHandler';
import RectangleSelector from './canvas/RectangleSelector';
import RegularNode from './nodes/RegularNode';
import ConditionalNode from './nodes/ConditionalNode';
import EnhancedEdgeRenderer from './EnhancedEdgeRenderer';
import BottomStatusBar from './layout/BottomStatusBar';

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
  hasUnsavedChanges?: boolean;
  onSelectionStateChange?: (state: { isSelecting: boolean; selectedCount: number }) => void;
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
  onClearPendingCreation,
  hasUnsavedChanges = false,
  onSelectionStateChange
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobileDetection();
  const analytics = useEnhancedAnalytics();
  
  const { createNode } = useNodeCreation({ onAddNode });

  // Multi-selection state with canvas ref
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
  } = useMultiSelection(canvasRef);

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

  // Update parent with selection state changes
  useEffect(() => {
    if (onSelectionStateChange) {
      onSelectionStateChange({
        isSelecting,
        selectedCount: selectedNodeIds.length
      });
    }
  }, [isSelecting, selectedNodeIds.length, onSelectionStateChange]);

  // Consolidated mouse event handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isMouseDown = false;
    let isDragging = false;
    let startCoords: { x: number; y: number } | null = null;

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      console.log('🖱️ Canvas mousedown:', {
        target: target.tagName,
        className: target.className,
        hasNode: !!target.closest('[data-node-id]'),
        hasSVG: !!target.closest('svg'),
        hasHandle: !!target.closest('.connection-handle'),
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        metaKey: event.metaKey
      });
      
      // Don't interfere with node interactions or other UI elements
      if (target.closest('[data-node-id]') || 
          target.closest('svg') || 
          target.closest('.connection-handle') ||
          pendingNodeType ||
          isMultiDragging) {
        console.log('🚫 Mousedown ignored - interacting with UI element');
        return;
      }

      // Only start selection on canvas background
      if (target === canvas || target.closest('.canvas-background')) {
        console.log('✅ Valid mousedown on canvas background');
        event.preventDefault();
        
        isMouseDown = true;
        isDragging = false;
        startCoords = getCanvasCoordinates(event, canvasRef);
        
        console.log('🔲 Mouse down at canvas coords:', startCoords);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isMouseDown || !startCoords) return;

      const currentCoords = getCanvasCoordinates(event, canvasRef);
      const deltaX = Math.abs(currentCoords.x - startCoords.x);
      const deltaY = Math.abs(currentCoords.y - startCoords.y);

      // Start rectangle selection after minimum movement
      if (!isDragging && (deltaX > 3 || deltaY > 3)) {
        console.log('🔲 Starting rectangle selection');
        isDragging = true;
        startRectangleSelection(startCoords.x, startCoords.y);
      }
      
      if (isDragging && isSelecting) {
        updateRectangleSelection(currentCoords.x, currentCoords.y);
      }
    };

    const handleMouseUp = (event: MouseEvent) => {
      console.log('🖱️ Mouse up:', { isMouseDown, isDragging, isSelecting });
      
      if (isMouseDown) {
        if (isDragging && isSelecting) {
          console.log('🔲 Ending rectangle selection');
          endRectangleSelection(nodes);
        } else if (!isDragging) {
          // Simple click on canvas background - clear all selections
          console.log('🧹 Canvas background click - clearing all selections');
          clearSelection();
          selectNodeSafely(null);
        }
      }
      
      // Reset state
      isMouseDown = false;
      isDragging = false;
      startCoords = null;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSelecting, isMultiDragging, pendingNodeType, nodes, startRectangleSelection, updateRectangleSelection, endRectangleSelection, clearSelection, selectNodeSafely]);

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
    } else if (!selectedNodeId && selectedNodeIds.length === 1) {
      // Don't clear multi-selection if user has selected multiple nodes
    } else if (!selectedNodeId && selectedNodeIds.length > 1) {
      // Keep multi-selection intact
    }
  }, [selectedNodeId, selectedNodeIds, selectSingleNode]);

  // Debug logging for selection state changes
  useEffect(() => {
    console.log(`📊 Canvas selection state - Node: ${selectedNodeId}, Edge: ${selectedEdgeId}, Multi: [${selectedNodeIds.join(', ')}], Selecting: ${isSelecting}, MultiDragging: ${isMultiDragging}`);
  }, [selectedNodeId, selectedEdgeId, selectedNodeIds, isSelecting, isMultiDragging]);

  const handleNodeSelect = (nodeId: string, event?: React.MouseEvent) => {
    const isCtrlPressed = event?.ctrlKey || event?.metaKey || false;
    const isShiftPressed = event?.shiftKey || false;
    
    console.log('🎯 Node select called:', { nodeId, isCtrlPressed, isShiftPressed, currentSelection: selectedNodeIds });
    
    // Prevent event from bubbling to canvas
    event?.stopPropagation();
    
    if (isCtrlPressed || isShiftPressed) {
      toggleNodeSelection(nodeId, isCtrlPressed, isShiftPressed, nodes);
      // For single node with modifiers, still update the main selection
      if (!isShiftPressed) {
        selectNodeSafely(nodeId);
      }
    } else {
      // Simple click - single selection
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
      console.log('🎯 Starting multi-node drag for:', selectedNodeIds);
      startMultiDrag(nodeId, event.clientX, event.clientY);
    }
  };

  return (
    <>
      <div className="h-full w-full relative" style={{ paddingBottom: '32px' }}>
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
                minWidth: '100%',
                minHeight: '100%',
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

                    {/* Render all nodes */}
                    {nodes.map((node) => {
                      const isSelected = selectedNodeIds.includes(node.id);
                      const isHovered = hoveredNodeId === node.id;
                      
                      return (
                        <div
                          key={node.id}
                          className={`${isHovered ? 'ring-2 ring-blue-400 ring-opacity-50 rounded-lg' : ''} ${
                            isSelected ? 'ring-4 ring-blue-500 ring-opacity-100 rounded-lg shadow-xl' : ''
                          } ${
                            isMobile ? 'touch-manipulation' : ''
                          } transition-all duration-200`}
                        >
                          {node.type === 'conditional' ? (
                            <ConditionalNode
                              node={node}
                              outgoingEdges={edges.filter(e => e.source === node.id)}
                              isSelected={isSelected}
                              canCreateEdge={canCreateEdge(node)}
                              onSelect={(id, event) => handleNodeSelect(id, event)}
                              onDoubleClick={() => handleNodeDoubleClick(node.id)}
                              onMove={handleMoveNode}
                              onDragStart={(event) => handleNodeDragStart(node.id, event)}
                              onStartConnection={handleStartConnection}
                              validationClass={getNodeValidationClass?.(node.id) || ''}
                              validationTooltip={getNodeTooltip?.(node.id) || ''}
                            />
                          ) : (
                            <RegularNode
                              node={node}
                              isSelected={isSelected}
                              canCreateEdge={canCreateEdge(node)}
                              onSelect={(id, event) => handleNodeSelect(id, event)}
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

                    {/* Status Bar */}
                    <BottomStatusBar
                      isSelecting={isSelecting}
                      selectedCount={selectedNodeIds.length}
                      pendingNodeType={pendingNodeType}
                      isCreatingEdge={isCreatingEdge}
                      hasUnsavedChanges={hasUnsavedChanges}
                    />
                  </>
                )}
              </EdgeCreationHandler>
            </div>
          </DragDropHandler>
        </ScrollArea>
      </div>
    </>
  );
};

export default Canvas;
