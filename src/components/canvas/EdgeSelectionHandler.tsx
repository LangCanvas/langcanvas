
import React, { useCallback } from 'react';
import { EnhancedEdge } from '../../types/edgeTypes';
import { useAdvancedEdgeSelection } from '../../hooks/useAdvancedEdgeSelection';

interface EdgeSelectionHandlerProps {
  edges: EnhancedEdge[];
  children: (props: {
    selectedEdgeIds: string[];
    isMultiSelecting: boolean;
    onEdgeClick: (e: React.MouseEvent, edgeId: string) => void;
    onEdgeDoubleClick: (e: React.MouseEvent, edgeId: string) => void;
    clearSelection: () => void;
    selectAllEdges: () => void;
    getSelectedEdges: () => EnhancedEdge[];
  }) => React.ReactNode;
  onSelectionChange?: (selectedEdges: EnhancedEdge[]) => void;
  onEdgeDoubleClick?: (edgeId: string) => void;
}

const EdgeSelectionHandler: React.FC<EdgeSelectionHandlerProps> = ({
  edges,
  children,
  onSelectionChange,
  onEdgeDoubleClick
}) => {
  const {
    selectionState,
    toggleEdgeSelection,
    clearSelection: clearSelectionInternal,
    selectAllEdges: selectAllEdgesInternal,
    getSelectedEdges
  } = useAdvancedEdgeSelection();

  const handleEdgeClick = useCallback((e: React.MouseEvent, edgeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isCtrlOrShiftPressed = e.ctrlKey || e.shiftKey || e.metaKey;
    toggleEdgeSelection(edgeId, isCtrlOrShiftPressed, edges);
    
    if (onSelectionChange) {
      const selectedEdges = getSelectedEdges(edges);
      onSelectionChange(selectedEdges);
    }
    
    console.log(`🔗 Edge selected: ${edgeId} (Multi: ${isCtrlOrShiftPressed})`);
  }, [toggleEdgeSelection, edges, onSelectionChange, getSelectedEdges]);

  const handleEdgeDoubleClick = useCallback((e: React.MouseEvent, edgeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onEdgeDoubleClick) {
      onEdgeDoubleClick(edgeId);
    }
    
    console.log(`🔗 Edge double-clicked: ${edgeId}`);
  }, [onEdgeDoubleClick]);

  const handleClearSelection = useCallback(() => {
    clearSelectionInternal();
    if (onSelectionChange) {
      onSelectionChange([]);
    }
  }, [clearSelectionInternal, onSelectionChange]);

  const handleSelectAllEdges = useCallback(() => {
    selectAllEdgesInternal(edges);
    if (onSelectionChange) {
      onSelectionChange(edges);
    }
  }, [selectAllEdgesInternal, edges, onSelectionChange]);

  const getSelectedEdgesCallback = useCallback(() => {
    return getSelectedEdges(edges);
  }, [getSelectedEdges, edges]);

  return (
    <>
      {children({
        selectedEdgeIds: selectionState.selectedEdgeIds,
        isMultiSelecting: selectionState.isMultiSelecting,
        onEdgeClick: handleEdgeClick,
        onEdgeDoubleClick: handleEdgeDoubleClick,
        clearSelection: handleClearSelection,
        selectAllEdges: handleSelectAllEdges,
        getSelectedEdges: getSelectedEdgesCallback
      })}
    </>
  );
};

export default EdgeSelectionHandler;
