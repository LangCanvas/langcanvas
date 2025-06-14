
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

    // Multi-drag should handle ANY selected node, even if it's just one.
    if (selectedNodeIds.includes(nodeId)) {
      console.log('✅ Initiating drag for selected node(s):', selectedNodeIds);
      startMultiDrag(nodeId, event.clientX, event.clientY);
      event.preventDefault(); // Crucial: Prevent useNodeDrag
      event.stopPropagation(); // Stop event from bubbling further
    } else {
      // If the node is not selected, we let the single-node drag handler (useNodeDrag) take over.
      // This happens when you click and drag an unselected node in a single motion.
      console.log('🤔 Letting single-node drag take over for unselected node:', nodeId);
    }
  }, [selectedNodeIds, startMultiDrag]);

  return {
    handleNodeSelect,
    handleNodeDoubleClick,
    handleNodeDragStart,
  };
};
