
import { useCallback } from 'react';
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
  selectSingleNode: (nodeId: string | null) => void;
  selectSingleEdge: (edgeId: string | null) => void;
  clearSelection: () => void;
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
    onSelectNode(null);
    onSelectEdge(null);
    clearSelection();
    analytics.trackFeatureUsage('selections_cleared');
  }, [onSelectNode, onSelectEdge, clearSelection, analytics]);

  const selectNodeSafely = useCallback((nodeId: string | null, preserveMultiSelection = false) => {
    onSelectEdge(null);
    onSelectNode(nodeId);
    if (!preserveMultiSelection) {
      selectSingleNode(nodeId);
    }
  }, [onSelectNode, onSelectEdge, selectSingleNode]);

  const selectEdgeSafely = useCallback((edgeId: string | null) => {
    onSelectNode(null);
    onSelectEdge(edgeId);
    selectSingleEdge(edgeId);
  }, [onSelectNode, onSelectEdge, selectSingleEdge]);

  const handleMoveNode = useCallback((id: string, x: number, y: number) => {
    onMoveNode(id, x, y);
    
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
