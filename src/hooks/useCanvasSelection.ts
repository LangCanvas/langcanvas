
import { useEffect } from 'react';

interface UseCanvasSelectionProps {
  selectedNodeId: string | null; // Primary selected node
  selectedEdgeId: string | null; // Primary selected edge
  selectedNodeIds: string[];   // Multi-selected nodes
  selectedEdgeIds: string[];   // Multi-selected edges
  selectSingleNode: (nodeId: string | null) => void; // Sets multi-selection to one node, clears edges
  selectSingleEdge: (edgeId: string | null) => void; // Sets multi-selection to one edge, clears nodes
  clearNodeMultiSelection: () => void; // Clears multi-selected nodes
  // clearEdgeMultiSelection is implicitly handled by selectSingleNode or clearSelection
  onSelectionStateChange?: (state: { isSelecting: boolean; selectedNodeCount: number; selectedEdgeCount: number }) => void;
  isSelecting: boolean; // Rectangle selection mode
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
  isSelecting, // Rectangle selection mode
}: UseCanvasSelectionProps) => {
  // Update parent with selection state changes
  useEffect(() => {
    if (onSelectionStateChange) {
      onSelectionStateChange({
        isSelecting, // isSelecting from rectangle selection
        selectedNodeCount: selectedNodeIds.length,
        selectedEdgeCount: selectedEdgeIds.length,
      });
    }
  }, [isSelecting, selectedNodeIds.length, selectedEdgeIds.length, onSelectionStateChange]);

  // When a primary edge is selected, ensure node multi-selection is cleared.
  useEffect(() => {
    if (selectedEdgeId) {
      console.log('🔗 Primary edge selected, ensuring node multi-selection is clear and this edge is in multi-select.');
      // selectSingleEdge(selectedEdgeId) already handles clearing selectedNodeIds and setting selectedEdgeIds.
      // This effect could simply ensure consistency if primary selection happens outside of selectSingleEdge call.
      if (!selectedEdgeIds.includes(selectedEdgeId) || selectedNodeIds.length > 0) {
         selectSingleEdge(selectedEdgeId);
      }
    }
  }, [selectedEdgeId, selectSingleEdge, selectedEdgeIds, selectedNodeIds]);

  // When a primary node is selected, ensure edge multi-selection is cleared.
  useEffect(() => {
    if (selectedNodeId) {
      console.log('🎯 Primary node selected, ensuring edge multi-selection is clear and this node is in multi-select.');
      // selectSingleNode(selectedNodeId) already handles clearing selectedEdgeIds and setting selectedNodeIds.
      // This effect ensures consistency.
      if (!selectedNodeIds.includes(selectedNodeId) || selectedEdgeIds.length > 0) {
        selectSingleNode(selectedNodeId);
      }
    }
  }, [selectedNodeId, selectSingleNode, selectedNodeIds, selectedEdgeIds]);
  
  // If primary selections are cleared, but multi-selections still exist, this might indicate a desync.
  // However, canvas click should clear all via clearSelection().
  // Modifier clicks handle their own multi-selection state.

  // Debug logging for selection state changes
  useEffect(() => {
    console.log(`📊 Canvas selection state - PrimaryNode: ${selectedNodeId}, PrimaryEdge: ${selectedEdgeId}, MultiNodes: [${selectedNodeIds.join(', ')}], MultiEdges: [${selectedEdgeIds.join(', ')}], RectSelecting: ${isSelecting}`);
  }, [selectedNodeId, selectedEdgeId, selectedNodeIds, selectedEdgeIds, isSelecting]);
};

