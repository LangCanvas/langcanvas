
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
  }, [
    canvasRef,
    scrollAreaRef,
    onSelectNode,
    onSelectEdge,
    createNodeWithAnalytics,
    pendingNodeType,
    onClearPendingCreation,
    analytics,
    clearAllSelections
  ]);

  return {
    clearAllSelections,
    selectNodeSafely,
    selectEdgeSafely,
    handleMoveNode,
  };
};
