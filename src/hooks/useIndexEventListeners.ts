
import React from 'react';
import { useIndexState } from './useIndexState'; // For types
import { useIndexHandlers } from './useIndexHandlers'; // For types
import { useIndexPanelHandlers } from './useIndexPanelHandlers'; // For types


type NodeCreationType = ReturnType<typeof useIndexState>['nodeCreation'];
type IndexHandlersType = ReturnType<typeof useIndexHandlers>;
type PanelHandlersType = ReturnType<typeof useIndexPanelHandlers>;

interface UseIndexEventListenersProps {
  nodeCreation: NodeCreationType;
  indexHandlers: IndexHandlersType;
  panelHandlers: PanelHandlersType;
}

export const useIndexEventListeners = ({
  nodeCreation,
  indexHandlers,
  panelHandlers,
}: UseIndexEventListenersProps) => {
  React.useEffect(() => {
    const handlePendingCreation = (event: CustomEvent) => {
      nodeCreation.setPendingCreation(event.detail);
    };

    const handleOpenPropertiesPanel = (event: CustomEvent) => {
      const { nodeId, edgeId, type } = event.detail;
      
      if (type === 'node' && nodeId) {
        indexHandlers.handleSelectNode(nodeId);
      } else if (type === 'edge' && edgeId) {
        indexHandlers.handleSelectEdge(edgeId);
      }
      
      panelHandlers.handleExpandRightPanel();
      panelHandlers.switchToPropertiesPanel();
    };

    window.addEventListener('setPendingCreation', handlePendingCreation as EventListener);
    window.addEventListener('openPropertiesPanel', handleOpenPropertiesPanel as EventListener);
    
    return () => {
      window.removeEventListener('setPendingCreation', handlePendingCreation as EventListener);
      window.removeEventListener('openPropertiesPanel', handleOpenPropertiesPanel as EventListener);
    };
  }, [
    nodeCreation.setPendingCreation, 
    indexHandlers.handleSelectNode, 
    indexHandlers.handleSelectEdge, 
    panelHandlers.handleExpandRightPanel, 
    panelHandlers.switchToPropertiesPanel
  ]);
};
