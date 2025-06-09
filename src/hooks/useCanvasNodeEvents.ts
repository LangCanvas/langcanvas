
import { useCallback } from 'react';
import { EnhancedNode } from '../types/nodeTypes';

interface UseCanvasNodeEventsProps {
  selectedNodeIds: string[];
  toggleNodeSelection: (nodeId: string, isCtrlPressed: boolean, isShiftPressed: boolean, nodes: EnhancedNode[]) => void;
  selectNodeSafely: (nodeId: string | null) => void;
  selectSingleNode: (nodeId: string | null) => void;
  startMultiDrag: (nodeId: string, clientX: number, clientY: number) => void;
  nodes: EnhancedNode[];
}

export const useCanvasNodeEvents = ({
  selectedNodeIds,
  toggleNodeSelection,
  selectNodeSafely,
  selectSingleNode,
  startMultiDrag,
  nodes,
}: UseCanvasNodeEventsProps) => {
  const handleNodeSelect = useCallback((nodeId: string, event?: React.MouseEvent) => {
    const isCtrlPressed = event?.ctrlKey || event?.metaKey || false;
    const isShiftPressed = event?.shiftKey || false;
    
    console.log('🎯 Node select called:', { nodeId, isCtrlPressed, isShiftPressed, currentSelection: selectedNodeIds });
    
    // Prevent event from bubbling to canvas
    event?.stopPropagation();
    
    if (isCtrlPressed || isShiftPressed) {
      toggleNodeSelection(nodeId, isCtrlPressed, isShiftPressed, nodes);
      // For single node with modifiers, still update the main selection
      if (!isShiftPressed) {
        selectNodeSafely(nodeId);
      }
    } else {
      // Simple click - single selection
      selectNodeSafely(nodeId);
      selectSingleNode(nodeId);
    }
  }, [selectedNodeIds, toggleNodeSelection, selectNodeSafely, selectSingleNode, nodes]);

  const handleNodeDoubleClick = useCallback((nodeId: string) => {
    // Dispatch custom event to open right panel
    window.dispatchEvent(new CustomEvent('openPropertiesPanel', { 
      detail: { nodeId, type: 'node' } 
    }));
  }, []);

  const handleNodeDragStart = useCallback((nodeId: string, event: React.MouseEvent) => {
    if (selectedNodeIds.includes(nodeId) && selectedNodeIds.length > 1) {
      console.log('🎯 Starting multi-node drag for:', selectedNodeIds);
      startMultiDrag(nodeId, event.clientX, event.clientY);
    }
  }, [selectedNodeIds, startMultiDrag]);

  return {
    handleNodeSelect,
    handleNodeDoubleClick,
    handleNodeDragStart,
  };
};
