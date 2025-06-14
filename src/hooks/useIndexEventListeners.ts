
import React from 'react';

interface UseIndexEventListenersProps {
  nodeCreation: any;
  indexHandlers: any;
  panelHandlers: any;
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
