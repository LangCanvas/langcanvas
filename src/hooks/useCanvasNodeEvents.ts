
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
    
    console.log('🎯 Node select called:', { nodeId, isCtrlOrShiftPressed, currentSelectedIds: selectedNodeIds });
    
    if (isCtrlOrShiftPressed) {
      toggleNodeSelection(nodeId, true, nodes);
      selectNodeSafely(nodeId, true);
    } else {
      // Simple click (no modifier)
      if (selectedNodeIds.includes(nodeId)) {
        // If clicking an already selected node, just set it as primary for drag.
        // Do not change the multi-selection.
        selectNodeSafely(nodeId, true);
        console.log('🎯 Node re-selected (no modifiers), selectedNodeIds preserved.');
      } else {
        // Clicking a new node makes it the only selection.
        selectNodeSafely(nodeId, false);
        console.log('🎯 New node selected (no modifiers), selection reset.');
      }
    }
  }, [toggleNodeSelection, selectNodeSafely, nodes, selectedNodeIds]);

  const handleNodeDoubleClick = useCallback((nodeId: string) => {
    // Dispatch custom event to open right panel
    window.dispatchEvent(new CustomEvent('openPropertiesPanel', { 
      detail: { nodeId, type: 'node' } 
    }));
  }, []);

  const handleNodeDragStart = useCallback((nodeId: string, event: React.PointerEvent) => {
    console.log('🚩 Node drag start requested:', { nodeId, eventX: event.clientX, eventY: event.clientY, selectedNodeIds });

    // Use current selection state (after handleNodeSelect was called)
    // Check if the node is now selected (selection happens before drag start)
    const isNodeSelected = selectedNodeIds.includes(nodeId);
    
    if (isNodeSelected || selectedNodeIds.length > 1) {
      console.log('✅ Initiating multi-drag for selected node(s):', selectedNodeIds);
      // Prevent single-node drag system from activating
      event.preventDefault();
      event.stopPropagation();
      
      // Start multi-drag
      startMultiDrag(nodeId, event.clientX, event.clientY);
    } else {
      // Let single-node drag handle this (unselected node)
      console.log('🤔 Letting single-node drag take over for unselected node:', nodeId);
      // Don't prevent default - let useNodeDrag handle it
    }
  }, [selectedNodeIds, startMultiDrag]);

  return {
    handleNodeSelect,
    handleNodeDoubleClick,
    handleNodeDragStart,
  };
};
