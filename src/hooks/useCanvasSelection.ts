import { useEffect } from 'react';
import { EnhancedNode } from '../types/nodeTypes';

interface UseCanvasSelectionProps {
  selectedNodeId: string | null;
  selectedNodeIds: string[];
  selectSingleNode: (nodeId: string | null) => void;
  selectNodeSafely: (nodeId: string | null) => void;
  onSelectionStateChange?: (state: { isSelecting: boolean; selectedCount: number }) => void;
  isSelecting: boolean;
}

export const useCanvasSelection = ({
  selectedNodeId,
  selectedNodeIds,
  selectSingleNode,
  selectNodeSafely,
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
    console.log(`📊 Canvas selection state - Node: ${selectedNodeId}, Multi: [${selectedNodeIds.join(', ')}], Selecting: ${isSelecting}`);
  }, [selectedNodeId, selectedNodeIds, isSelecting]);
};
