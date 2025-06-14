
import { useRef } from 'react';
import { EnhancedNode, NodeType } from '../types/nodeTypes';
import { EnhancedEdge } from '../types/edgeTypes';
import { useNodeCreation } from './useNodeCreation';
import { useMobileDetection } from './useMobileDetection';
import { useEnhancedAnalytics } from './useEnhancedAnalytics';
import { useMultiSelection } from './useMultiSelection';
import { useMultiNodeDrag } from './useMultiNodeDrag';

interface UseCanvasStateProps {
  nodes: EnhancedNode[];
  edges: EnhancedEdge[];
  onAddNode: (type: NodeType, x: number, y: number) => EnhancedNode | null;
  onMoveNode: (id: string, x: number, y: number) => void;
}

export const useCanvasState = ({
  nodes,
  edges,
  onAddNode,
  onMoveNode,
}: UseCanvasStateProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobileDetection();
  const analytics = useEnhancedAnalytics();
  
  const { createNode } = useNodeCreation({ onAddNode });

  const multiSelection = useMultiSelection(canvasRef);

  const multiNodeDrag = useMultiNodeDrag(
    multiSelection.selectedNodeIds, 
    nodes, 
    onMoveNode
  );

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

  return {
    canvasRef,
    scrollAreaRef,
    isMobile,
    analytics,
    createNodeWithAnalytics,
    multiSelection,
    multiNodeDrag,
  };
};
