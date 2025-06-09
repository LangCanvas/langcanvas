
import { useEffect } from 'react';

interface UseCanvasSelectionProps {
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  selectedNodeIds: string[];
  selectSingleNode: (nodeId: string | null) => void;
  selectNodeSafely: (nodeId: string | null) => void;
  clearMultiSelection: () => void;
  onSelectionStateChange?: (state: { isSelecting: boolean; selectedCount: number }) => void;
  isSelecting: boolean;
}

export const useCanvasSelection = ({
  selectedNodeId,
  selectedEdgeId,
  selectedNodeIds,
  selectSingleNode,
  selectNodeSafely,
  clearMultiSelection,
  onSelectionStateChange,
  isSelecting,
}: UseCanvasSelectionProps) => {
  // Update parent with selection state changes
  useEffect(() => {
    if (onSelectionStateChange) {
      onSelectionStateChange({
        isSelecting,
        selectedCount: selectedNodeIds.length
      });
    }
  }, [isSelecting, selectedNodeIds.length, onSelectionStateChange]);

  // Clear multi-selection when edge is selected
  useEffect(() => {
    if (selectedEdgeId) {
      console.log('🔗 Edge selected, clearing multi-selection');
      clearMultiSelection();
    }
  }, [selectedEdgeId, clearMultiSelection]);

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
    console.log(`📊 Canvas selection state - Node: ${selectedNodeId}, Edge: ${selectedEdgeId}, Multi: [${selectedNodeIds.join(', ')}], Selecting: ${isSelecting}`);
  }, [selectedNodeId, selectedEdgeId, selectedNodeIds, isSelecting]);
};
