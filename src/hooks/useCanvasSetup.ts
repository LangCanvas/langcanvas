
import { EnhancedNode } from '../types/nodeTypes';
import { EnhancedEdge } from '../types/edgeTypes';
import { useCanvasState } from './useCanvasState';
import { useCanvasHandlers } from './useCanvasHandlers';
import { useCanvasSelection } from './useCanvasSelection';
import { useCanvasNodeEvents } from './useCanvasNodeEvents';
import { useAStarPathfinding } from './useAStarPathfinding';

interface UseCanvasSetupProps {
  nodes: EnhancedNode[];
  edges: EnhancedEdge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  onAddNode: any;
  onSelectNode: (id: string | null) => void;
  onSelectEdge: (id: string | null) => void;
  onMoveNode: (id: string, x: number, y: number) => void;
  pendingNodeType?: any;
  onClearPendingCreation?: () => void;
  onSelectionStateChange?: (state: { isSelecting: boolean; selectedNodeCount: number; selectedEdgeCount: number }) => void;
}

export const useCanvasSetup = ({
  nodes,
  edges,
  selectedNodeId,
  selectedEdgeId,
  onAddNode,
  onSelectNode,
  onSelectEdge,
  onMoveNode,
  pendingNodeType,
  onClearPendingCreation,
  onSelectionStateChange
}: UseCanvasSetupProps) => {
  // Initialize A* pathfinding system
  const { getPathfindingStats } = useAStarPathfinding(nodes);

  const canvasState = useCanvasState({
    nodes,
    edges,
    onAddNode,
    onMoveNode,
  });

  const {
    canvasRef,
    scrollAreaRef,
    isMobile,
    createNodeWithAnalytics,
    multiSelection,
    multiNodeDrag,
  } = canvasState;

  const canvasHandlers = useCanvasHandlers({
    canvasRef,
    scrollAreaRef,
    onSelectNode,
    onSelectEdge,
    createNodeWithAnalytics,
    pendingNodeType,
    onClearPendingCreation,
    onMoveNode,
    nodes,
    selectSingleNode: multiSelection.selectSingleNode,
    selectSingleEdge: multiSelection.selectSingleEdge,
    clearSelection: multiSelection.clearSelection,
  });

  useCanvasSelection({
    selectedNodeId,
    selectedEdgeId,
    selectedNodeIds: multiSelection.selectedNodeIds,
    selectedEdgeIds: multiSelection.selectedEdgeIds,
    selectSingleNode: multiSelection.selectSingleNode,
    selectSingleEdge: multiSelection.selectSingleEdge,
    clearNodeMultiSelection: multiSelection.clearNodeMultiSelection,
    onSelectionStateChange,
    isSelecting: multiSelection.isSelecting,
  });

  const nodeEvents = useCanvasNodeEvents({
    toggleNodeSelection: multiSelection.toggleNodeSelection,
    selectNodeSafely: canvasHandlers.selectNodeSafely,
    selectSingleNode: multiSelection.selectSingleNode,
    startMultiDrag: multiNodeDrag.startDrag,
    nodes,
    selectedNodeIds: multiSelection.selectedNodeIds,
  });

  return {
    canvasRef,
    scrollAreaRef,
    isMobile,
    getPathfindingStats,
    multiSelection,
    multiNodeDrag,
    canvasHandlers,
    nodeEvents
  };
};
