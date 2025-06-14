
import { useCallback } from 'react';
import { EnhancedNode } from '../types/nodeTypes';

interface UseCanvasNodeEventsProps {
  toggleNodeSelection: (nodeId: string, isCtrlOrShiftPressed: boolean, nodes: EnhancedNode[]) => void;
  selectNodeSafely: (nodeId: string | null) => void; 
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
    
    // Stop propagation early to prevent canvas click or other higher-level handlers
    // if we are interacting with a node.
    event?.stopPropagation(); 
    
    console.log('🎯 Node select called:', { nodeId, isCtrlOrShiftPressed, currentSelectedIds: selectedNodeIds });
    
    if (isCtrlOrShiftPressed) {
      toggleNodeSelection(nodeId, true, nodes); 
    } else {
      // Simple click (no modifier)
      if (selectedNodeIds.includes(nodeId)) {
        // If clicking an already selected node (likely to start a drag or re-affirm primary)
        // just ensure it's the primary selected node. Don't clear other selections.
        selectNodeSafely(nodeId);
        console.log('🎯 Node re-selected (no modifiers), selectedNodeIds preserved:', selectedNodeIds);
      } else {
        // Clicking a new node without modifiers - set it as the only selected node.
        selectNodeSafely(nodeId); 
        selectSingleNode(nodeId); 
        console.log('🎯 New node selected (no modifiers), selectedNodeIds reset to:', [nodeId]);
      }
    }
  }, [toggleNodeSelection, selectNodeSafely, selectSingleNode, nodes, selectedNodeIds]);

  const handleNodeDoubleClick = useCallback((nodeId: string) => {
    // Dispatch custom event to open right panel
    window.dispatchEvent(new CustomEvent('openPropertiesPanel', { 
      detail: { nodeId, type: 'node' } 
    }));
  }, []);

  const handleNodeDragStart = useCallback((nodeId: string, event: React.MouseEvent) => {
    // This function is called when a mousedown occurs on a node that might initiate a drag.
    // It should decide if it's a multi-drag scenario.
    // The `selectedNodeIds` here should be "fresh" due to hook dependencies.
    console.log('🚩 Node drag start requested:', { nodeId, eventX: event.clientX, eventY: event.clientY, selectedNodeIds });

    if (selectedNodeIds.includes(nodeId) && selectedNodeIds.length > 0) {
      // If the clicked node is part of any selection (even if it's the only one),
      // use the multi-drag system.
      console.log('✅ Initiating multi-node drag for node:', nodeId, 'in selection:', selectedNodeIds);
      startMultiDrag(nodeId, event.clientX, event.clientY);
      event.preventDefault(); // Crucial: Prevent useNodeDrag and other default actions
      event.stopPropagation(); // Stop event from bubbling further
    } else {
      // This case should ideally not be hit if handleNodeSelect correctly populates selectedNodeIds
      // before this is called. If it is, it means single-node drag via useNodeDrag will take over.
      console.log('🤔 Node not in current selection or selection empty, single drag might take over for:', nodeId);
    }
  }, [selectedNodeIds, startMultiDrag]);

  return {
    handleNodeSelect,
    handleNodeDoubleClick,
    handleNodeDragStart,
  };
};
