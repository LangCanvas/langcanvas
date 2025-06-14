import React, { useRef, useEffect } from 'react';
import { EnhancedNode, NodeType } from '../types/nodeTypes';
import { EnhancedEdge } from '../types/edgeTypes';
import { useNodeCreation } from '../hooks/useNodeCreation';
import { useMobileDetection } from '../hooks/useMobileDetection';
import { useEnhancedAnalytics } from '../hooks/useEnhancedAnalytics';
import { useCanvasHandlers } from '../hooks/useCanvasHandlers';
import { useMultiSelection } from '../hooks/useMultiSelection';
import { useMultiNodeDrag } from '../hooks/useMultiNodeDrag';
import { useCanvasMouseEvents } from '../hooks/useCanvasMouseEvents';
import { useCanvasSelection } from '../hooks/useCanvasSelection';
import { useCanvasNodeEvents } from '../hooks/useCanvasNodeEvents';
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
  selectedNodeId: string | null; // Primary selected node
  selectedEdgeId: string | null; // Primary selected edge
  onAddNode: (type: NodeType, x: number, y: number) => EnhancedNode | null;
  onSelectNode: (id: string | null) => void; // Sets primary selected node
  onSelectEdge: (id: string | null) => void; // Sets primary selected edge
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
  onSelectionStateChange?: (state: { isSelecting: boolean; selectedNodeCount: number; selectedEdgeCount: number }) => void;
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

  const {
    selectedNodeIds,
    selectedEdgeIds, // New from useMultiSelection
    isSelecting, // Rectangle selection state
    selectionRect,
    selectSingleNode,
    selectSingleEdge, // New from useMultiSelection
    toggleNodeSelection,
    toggleEdgeSelection, // New from useMultiSelection
    clearSelection,
    clearNodeMultiSelection, // Renamed for clarity
    // clearEdgeMultiSelection, // Not directly used by Canvas, useMultiSelection handles internally
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
    clearAllSelections, // Now available from useCanvasHandlers
  } = useCanvasHandlers({
    canvasRef,
    scrollAreaRef,
    onSelectNode, // For primary node
    onSelectEdge, // For primary edge
    createNodeWithAnalytics,
    pendingNodeType,
    onClearPendingCreation,
    onMoveNode,
    nodes,
    // Pass multi-selection functions to useCanvasHandlers
    selectSingleNode,
    selectSingleEdge,
    clearSelection, // This is clearSelection from useMultiSelection
  });

  useCanvasSelection({
    selectedNodeId,
    selectedEdgeId,
    selectedNodeIds,
    selectedEdgeIds, // Pass new state
    selectSingleNode,
    selectSingleEdge, // Pass new function
    clearNodeMultiSelection, // Pass renamed function
    onSelectionStateChange,
    isSelecting, // Pass rectangle selection state
  });

  useCanvasMouseEvents({
    canvasRef,
    isSelecting, // Pass rectangle selection state
    isMultiDragging,
    pendingNodeType,
    nodes,
    startRectangleSelection,
    updateRectangleSelection: (x: number, y: number) => updateRectangleSelection(x, y, nodes),
    endRectangleSelection,
    clearSelection, // From useMultiSelection (passed via useCanvasHandlers or directly)
    selectNodeSafely, // From useCanvasHandlers
    selectEdgeSafely, // From useCanvasHandlers
  });

  const {
    handleNodeSelect,
    handleNodeDoubleClick,
    handleNodeDragStart,
  } = useCanvasNodeEvents({
    toggleNodeSelection, // From useMultiSelection
    selectNodeSafely,    // From useCanvasHandlers
    selectSingleNode,    // From useMultiSelection
    startMultiDrag,
    nodes,
    selectedNodeIds,     // Still needed for multi-drag logic
  });

  // Handler for primary edge selection (non-modifier click)
  const handleSelectSingleEdge = (edgeId: string | null) => {
    selectEdgeSafely(edgeId); // This updates primary and multi-selection state
  };
  
  // Handler for toggling edge in multi-selection (modifier click)
  const handleToggleEdgeSelection = (edgeId: string, isCtrlOrShiftPressed: boolean) => {
    // toggleEdgeSelection is already from useMultiSelection, which updates selectedEdgeIds and clears selectedNodeIds
    toggleEdgeSelection(edgeId, isCtrlOrShiftPressed);
  };

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

  const handleEdgeDoubleClick = (edgeId: string) => {
    // Dispatch custom event to open right panel  
    window.dispatchEvent(new CustomEvent('openPropertiesPanel', { 
      detail: { edgeId, type: 'edge' } 
    }));
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
                isSelecting ? 'cursor-crosshair' : '' // isSelecting for rectangle
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
                selectedNodeId={selectedNodeId} // Primary selected node
                selectedEdgeId={selectedEdgeId} // Primary selected edge
                // For deletion, we might want to delete all selected items (nodes and edges)
                // This would require passing selectedNodeIds and selectedEdgeIds
                // And updating onDeleteNode/onDeleteEdge to handle multiple IDs.
                // For now, keeping it to primary selected item.
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
                      isDragOver={false} // This prop seems to be static false
                      isMobile={isMobile} 
                      nodeCount={nodes.length} 
                    />

                    <EnhancedEdgeRenderer
                      edges={edges}
                      nodes={nodes}
                      selectedEdgeId={selectedEdgeId} // Primary selected edge
                      selectedEdgeIds={selectedEdgeIds} // Multi-selected edges
                      onSelectSingleEdge={handleSelectSingleEdge} // For non-modifier clicks
                      onToggleEdgeSelection={handleToggleEdgeSelection} // For modifier clicks
                      onDoubleClick={handleEdgeDoubleClick}
                      getEdgeValidationClass={getEdgeValidationClass}
                      getEdgeTooltip={getEdgeTooltip}
                    />

                    {/* Rectangle Selection */}
                    <RectangleSelector
                      selectionRect={selectionRect}
                      isSelecting={isSelecting} // isSelecting for rectangle
                    />

                    {/* Edge Preview while creating */}
                    <EdgePreview edgePreview={edgePreview} />

                    {/* Render all nodes */}
                    {nodes.map((node) => {
                      const isSelected = selectedNodeIds.includes(node.id); // Check against multi-selected nodes
                      const isPrimarySelected = selectedNodeId === node.id; // For stronger highlight if needed
                      const displaySelected = isSelected || isPrimarySelected; // Combine for basic selection highlight

                      const isHovered = hoveredNodeId === node.id;
                      
                      return (
                        <div
                          key={node.id}
                          className={`${isHovered ? 'ring-2 ring-blue-400 ring-opacity-50 rounded-lg' : ''} ${
                            displaySelected ? 'ring-4 ring-blue-500 ring-opacity-100 rounded-lg shadow-xl' : '' // Updated selection class check
                          } ${
                            isMobile ? 'touch-manipulation' : ''
                          } transition-all duration-200`}
                        >
                          {node.type === 'conditional' ? (
                            <ConditionalNode
                              node={node}
                              outgoingEdges={edges.filter(e => e.source === node.id)}
                              isSelected={displaySelected} // Pass combined selection state
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
                              isSelected={displaySelected} // Pass combined selection state
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

                    <BottomStatusBar
                      isSelecting={isSelecting} // Rectangle selection
                      selectedCount={selectedNodeIds.length + selectedEdgeIds.length} // Total multi-selected items
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
