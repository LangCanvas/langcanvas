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
}: UseCanvasHandlersProps) => {
  const analytics = useEnhancedAnalytics();

  // Clear selection helper function
  const clearAllSelections = useCallback(() => {
    console.log('🔄 Clearing all selections');
    onSelectNode(null);
    onSelectEdge(null);
    
    // Track selection clearing
    analytics.trackFeatureUsage('selections_cleared');
  }, [onSelectNode, onSelectEdge, analytics]);

  // Safe node selection that clears edge selection
  const selectNodeSafely = useCallback((nodeId: string | null) => {
    console.log(`🎯 Selecting node: ${nodeId}, clearing edge selection`);
    onSelectEdge(null); // Clear edge selection first
    onSelectNode(nodeId);
  }, [onSelectNode, onSelectEdge]);

  // Safe edge selection that clears node selection
  const selectEdgeSafely = useCallback((edgeId: string | null) => {
    console.log(`🔗 Selecting edge: ${edgeId}, clearing node selection`);
    onSelectNode(null); // Clear node selection first
    onSelectEdge(edgeId);
  }, [onSelectNode, onSelectEdge]);

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

  // Removed the conflicting click event handler that was interfering with rectangle selection
  // Canvas click handling is now managed by the rectangle selection logic in Canvas.tsx

  return {
    clearAllSelections,
    selectNodeSafely,
    selectEdgeSafely,
    handleMoveNode,
  };
};
