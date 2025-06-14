
import React from 'react';

export const useIndexSelectionState = () => {
  const [selectionState, setSelectionState] = React.useState({
    isSelecting: false,
    selectedCount: 0,
  });

  const handleCanvasSelectionChange = React.useCallback((state: { isSelecting: boolean; selectedNodeCount: number; selectedEdgeCount: number; }) => {
    setSelectionState({
      isSelecting: state.isSelecting,
      selectedCount: state.selectedNodeCount + state.selectedEdgeCount,
    });
  }, []);

  return {
    selectionState,
    handleCanvasSelectionChange,
  };
};
