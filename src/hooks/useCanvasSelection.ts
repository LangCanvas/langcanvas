
import { useEffect } from 'react';

interface UseCanvasSelectionProps {
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
  selectSingleNode: (nodeId: string | null) => void;
  selectSingleEdge: (edgeId: string | null) => void;
  clearNodeMultiSelection: () => void;
  onSelectionStateChange?: (state: { isSelecting: boolean; selectedNodeCount: number; selectedEdgeCount: number }) => void;
  isSelecting: boolean;
}

export const useCanvasSelection = ({
  selectedNodeId,
  selectedEdgeId,
  selectedNodeIds,
  selectedEdgeIds,
  selectSingleNode,
  selectSingleEdge,
  clearNodeMultiSelection,
  onSelectionStateChange,
  isSelecting,
}: UseCanvasSelectionProps) => {
  // Update parent with selection state changes
  useEffect(() => {
    if (onSelectionStateChange) {
      onSelectionStateChange({
        isSelecting,
        selectedNodeCount: selectedNodeIds.length,
        selectedEdgeCount: selectedEdgeIds.length,
      });
    }
  }, [isSelecting, selectedNodeIds.length, selectedEdgeIds.length, onSelectionStateChange]);

  // Sync primary edge selection with multi-selection
  useEffect(() => {
    if (selectedEdgeId && (!selectedEdgeIds.includes(selectedEdgeId) || selectedNodeIds.length > 0)) {
      selectSingleEdge(selectedEdgeId);
    }
  }, [selectedEdgeId, selectSingleEdge, selectedEdgeIds, selectedNodeIds]);

  // Sync primary node selection with multi-selection
  useEffect(() => {
    if (selectedNodeId && (!selectedNodeIds.includes(selectedNodeId) || selectedEdgeIds.length > 0)) {
      selectSingleNode(selectedNodeId);
    }
  }, [selectedNodeId, selectSingleNode, selectedNodeIds, selectedEdgeIds]);
};
