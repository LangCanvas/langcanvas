
import { useState, useCallback, useRef } from 'react';
import { EnhancedEdge } from '../types/edgeTypes';

export interface EdgeSelectionState {
  selectedEdgeIds: string[];
  lastSelectedEdgeId: string | null;
  isMultiSelecting: boolean;
}

export const useAdvancedEdgeSelection = () => {
  const [selectionState, setSelectionState] = useState<EdgeSelectionState>({
    selectedEdgeIds: [],
    lastSelectedEdgeId: null,
    isMultiSelecting: false
  });

  const selectionStartRef = useRef<string | null>(null);

  const selectSingleEdge = useCallback((edgeId: string | null) => {
    setSelectionState({
      selectedEdgeIds: edgeId ? [edgeId] : [],
      lastSelectedEdgeId: edgeId,
      isMultiSelecting: false
    });
  }, []);

  const toggleEdgeSelection = useCallback((
    edgeId: string, 
    isCtrlOrShiftPressed: boolean,
    edges: EnhancedEdge[] = []
  ) => {
    setSelectionState(prev => {
      if (!isCtrlOrShiftPressed) {
        return {
          selectedEdgeIds: [edgeId],
          lastSelectedEdgeId: edgeId,
          isMultiSelecting: false
        };
      }

      const isCurrentlySelected = prev.selectedEdgeIds.includes(edgeId);
      let newSelectedIds: string[];

      if (isCurrentlySelected) {
        newSelectedIds = prev.selectedEdgeIds.filter(id => id !== edgeId);
      } else {
        newSelectedIds = [...prev.selectedEdgeIds, edgeId];
      }

      return {
        selectedEdgeIds: newSelectedIds,
        lastSelectedEdgeId: edgeId,
        isMultiSelecting: newSelectedIds.length > 1
      };
    });
  }, []);

  const selectEdgeRange = useCallback((
    startEdgeId: string,
    endEdgeId: string,
    edges: EnhancedEdge[]
  ) => {
    const startIndex = edges.findIndex(edge => edge.id === startEdgeId);
    const endIndex = edges.findIndex(edge => edge.id === endEdgeId);
    
    if (startIndex === -1 || endIndex === -1) return;
    
    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);
    
    const rangeEdgeIds = edges
      .slice(minIndex, maxIndex + 1)
      .map(edge => edge.id);
    
    setSelectionState(prev => ({
      selectedEdgeIds: Array.from(new Set([...prev.selectedEdgeIds, ...rangeEdgeIds])),
      lastSelectedEdgeId: endEdgeId,
      isMultiSelecting: true
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectionState({
      selectedEdgeIds: [],
      lastSelectedEdgeId: null,
      isMultiSelecting: false
    });
    selectionStartRef.current = null;
  }, []);

  const selectAllEdges = useCallback((edges: EnhancedEdge[]) => {
    const allEdgeIds = edges.map(edge => edge.id);
    setSelectionState({
      selectedEdgeIds: allEdgeIds,
      lastSelectedEdgeId: allEdgeIds[allEdgeIds.length - 1] || null,
      isMultiSelecting: allEdgeIds.length > 1
    });
  }, []);

  const getSelectedEdges = useCallback((edges: EnhancedEdge[]) => {
    return edges.filter(edge => selectionState.selectedEdgeIds.includes(edge.id));
  }, [selectionState.selectedEdgeIds]);

  const isEdgeSelected = useCallback((edgeId: string) => {
    return selectionState.selectedEdgeIds.includes(edgeId);
  }, [selectionState.selectedEdgeIds]);

  return {
    selectionState,
    selectSingleEdge,
    toggleEdgeSelection,
    selectEdgeRange,
    clearSelection,
    selectAllEdges,
    getSelectedEdges,
    isEdgeSelected
  };
};
