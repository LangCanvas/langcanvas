
import { useCallback } from 'react';
import { EnhancedNode } from '../types/nodeTypes';

interface UseCanvasNodeEventsProps {
  toggleNodeSelection: (nodeId: string, isCtrlOrShiftPressed: boolean, nodes: EnhancedNode[]) => void;
  selectNodeSafely: (nodeId: string | null, preserveMultiSelection?: boolean) => void;
  selectSingleNode: (nodeId: string | null) => void; 
  startMultiDrag: (nodeId: string, clientX: number, clientY: number) => void;
  nodes: EnhancedNode[];
  selectedNodeIds: string[]; 
}

export const useCanvasNodeEvents = ({
  toggleNodeSelection,
  selectNodeSafely,
  selectSingleNode,
  startMultiDrag,
  nodes,
  selectedNodeIds,
}: UseCanvasNodeEventsProps) => {
  const handleNodeSelect = useCallback((nodeId: string, event?: React.MouseEvent) => {
    const isCtrlOrShiftPressed = event?.ctrlKey || event?.metaKey || event?.shiftKey || false;
    
    event?.stopPropagation(); 
    
    if (isCtrlOrShiftPressed) {
      toggleNodeSelection(nodeId, true, nodes);
      selectNodeSafely(nodeId, true);
    } else {
      if (selectedNodeIds.includes(nodeId)) {
        selectNodeSafely(nodeId, true);
      } else {
        selectNodeSafely(nodeId, false);
      }
    }
  }, [toggleNodeSelection, selectNodeSafely, nodes, selectedNodeIds]);

  const handleNodeDoubleClick = useCallback((nodeId: string) => {
    window.dispatchEvent(new CustomEvent('openPropertiesPanel', { 
      detail: { nodeId, type: 'node' } 
    }));
  }, []);

  const handleNodeDragStart = useCallback((nodeId: string, event: React.PointerEvent) => {
    const currentlySelected = selectedNodeIds.includes(nodeId);
    const hasMultipleSelected = selectedNodeIds.length > 1;
    
    if (currentlySelected || hasMultipleSelected) {
      event.preventDefault();
      event.stopPropagation();
      startMultiDrag(nodeId, event.clientX, event.clientY);
    }
  }, [selectedNodeIds, startMultiDrag]);

  return {
    handleNodeSelect,
    handleNodeDoubleClick,
    handleNodeDragStart,
  };
};
