import { useCallback } from 'react';
import { EnhancedNode } from '../types/nodeTypes';

interface UseCanvasNodeEventsProps {
  // selectedNodeIds is managed by useMultiSelection, not directly needed here for its own state
  toggleNodeSelection: (nodeId: string, isCtrlOrShiftPressed: boolean, nodes: EnhancedNode[]) => void;
  selectNodeSafely: (nodeId: string | null) => void; // For primary selection
  selectSingleNode: (nodeId: string | null) => void; // For multi-selection state
  startMultiDrag: (nodeId: string, clientX: number, clientY: number) => void;
  nodes: EnhancedNode[];
  selectedNodeIds: string[]; // Still needed for startMultiDrag logic
}

export const useCanvasNodeEvents = ({
  toggleNodeSelection,
  selectNodeSafely,
  selectSingleNode,
  startMultiDrag,
  nodes,
  selectedNodeIds, // Keep for multi-drag check
}: UseCanvasNodeEventsProps) => {
  const handleNodeSelect = useCallback((nodeId: string, event?: React.MouseEvent) => {
    const isCtrlOrShiftPressed = event?.ctrlKey || event?.metaKey || event?.shiftKey || false;
    
    console.log('🎯 Node select called:', { nodeId, isCtrlOrShiftPressed });
    
    event?.stopPropagation();
    
    if (isCtrlOrShiftPressed) {
      // Toggle selection for this node within the multi-selection group
      toggleNodeSelection(nodeId, true, nodes); 
      // selectNodeSafely might still be needed if primary selection should follow last toggle
      // For now, let primary selection be handled by non-modifier click or separate logic
      // if a node is added via modifier, it becomes part of multi-select but not necessarily primary
    } else {
      // Simple click - single selection (both primary and multi-selection state)
      selectNodeSafely(nodeId); // Sets primary selected node, clears primary selected edge
      selectSingleNode(nodeId); // Sets multi-selection to only this node
    }
  }, [toggleNodeSelection, selectNodeSafely, selectSingleNode, nodes]);

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
