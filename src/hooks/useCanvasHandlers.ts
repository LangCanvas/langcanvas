import { useEffect, useCallback } from 'react';
import { EnhancedNode, NodeType } from '../types/nodeTypes';
import { useEnhancedAnalytics } from './useEnhancedAnalytics';

interface UseCanvasHandlersProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
  onSelectNode: (id: string | null) => void; // Primary node selection
  onSelectEdge: (id: string | null) => void; // Primary edge selection
  createNodeWithAnalytics: (type: NodeType, x: number, y: number) => EnhancedNode | null;
  pendingNodeType?: NodeType | null;
  onClearPendingCreation?: () => void;
  onMoveNode: (id: string, x: number, y: number) => void;
  nodes: EnhancedNode[];
  
  // Functions from useMultiSelection
  selectSingleNode: (nodeId: string | null) => void;
  selectSingleEdge: (edgeId: string | null) => void;
  clearSelection: () => void; // Clears both node and edge multi-selections
}

export const useCanvasHandlers = ({
  canvasRef,
  scrollAreaRef,
  onSelectNode,
  onSelectEdge,
  createNodeWithAnalytics,
  pendingNodeType,
  onClearPendingCreation,
  onMoveNode,
  nodes,
  selectSingleNode,
  selectSingleEdge,
  clearSelection,
}: UseCanvasHandlersProps) => {
  const analytics = useEnhancedAnalytics();

  const clearAllSelections = useCallback(() => {
    console.log('🔄 Clearing all selections (primary and multi)');
    onSelectNode(null); // Clear primary selected node
    onSelectEdge(null); // Clear primary selected edge
    clearSelection();   // Clear multi-selected nodes and edges
    
    analytics.trackFeatureUsage('selections_cleared');
  }, [onSelectNode, onSelectEdge, clearSelection, analytics]);

  const selectNodeSafely = useCallback((nodeId: string | null) => {
    console.log(`🎯 Selecting node safely (primary): ${nodeId}`);
    onSelectEdge(null);   // Clear primary selected edge
    onSelectNode(nodeId); // Set primary selected node
    selectSingleNode(nodeId); // Update multi-selection state to this single node
  }, [onSelectNode, onSelectEdge, selectSingleNode]);

  const selectEdgeSafely = useCallback((edgeId: string | null) => {
    console.log(`🔗 Selecting edge safely (primary): ${edgeId}`);
    onSelectNode(null);   // Clear primary selected node
    onSelectEdge(edgeId); // Set primary selected edge
    selectSingleEdge(edgeId); // Update multi-selection state to this single edge
  }, [onSelectNode, onSelectEdge, selectSingleEdge]);

  // Enhanced move handler with analytics
  const handleMoveNode = useCallback((id: string, x: number, y: number) => {
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
  }, [onMoveNode, analytics, nodes]);

  return {
    clearAllSelections,
    selectNodeSafely,
    selectEdgeSafely,
    handleMoveNode,
  };
};
