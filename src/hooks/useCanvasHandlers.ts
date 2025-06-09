
import { useEffect, useCallback } from 'react';
import { EnhancedNode, NodeType } from '../types/nodeTypes';
import { useEnhancedAnalytics } from './useEnhancedAnalytics';

interface UseCanvasHandlersProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
  onSelectNode: (id: string | null) => void;
  onSelectEdge: (id: string | null) => void;
  createNodeWithAnalytics: (type: NodeType, x: number, y: number) => EnhancedNode | null;
  pendingNodeType?: NodeType | null;
  onClearPendingCreation?: () => void;
  onMoveNode: (id: string, x: number, y: number) => void;
  nodes: EnhancedNode[];
  clearMultiSelection?: () => void;
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
  clearMultiSelection,
}: UseCanvasHandlersProps) => {
  const analytics = useEnhancedAnalytics();

  // Clear selection helper function
  const clearAllSelections = useCallback(() => {
    console.log('🔄 Clearing all selections');
    onSelectNode(null);
    onSelectEdge(null);
    clearMultiSelection?.();
    
    // Track selection clearing
    analytics.trackFeatureUsage('selections_cleared');
  }, [onSelectNode, onSelectEdge, clearMultiSelection, analytics]);

  // Safe node selection that clears edge selection
  const selectNodeSafely = useCallback((nodeId: string | null) => {
    console.log(`🎯 Selecting node: ${nodeId}, clearing edge selection`);
    onSelectEdge(null); // Clear edge selection first
    onSelectNode(nodeId);
  }, [onSelectNode, onSelectEdge]);

  // Safe edge selection that clears node selection and multi-selection
  const selectEdgeSafely = useCallback((edgeId: string | null) => {
    console.log(`🔗 Selecting edge: ${edgeId}, clearing node and multi-selection`);
    onSelectNode(null); // Clear node selection first
    clearMultiSelection?.(); // Clear multi-selection
    onSelectEdge(edgeId);
  }, [onSelectNode, onSelectEdge, clearMultiSelection]);

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
