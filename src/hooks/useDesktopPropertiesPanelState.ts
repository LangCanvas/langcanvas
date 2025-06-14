
import { useEffect, useState } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { EnhancedEdge } from '../types/edgeTypes';

interface UseDesktopPropertiesPanelStateProps {
  selectedNode: EnhancedNode | null;
  selectedEdge: EnhancedEdge | null;
  showValidationPanel: boolean;
  setShowValidationPanel: (show: boolean) => void;
  switchToPropertiesPanel?: () => void;
}

export const useDesktopPropertiesPanelState = ({
  selectedNode,
  selectedEdge,
  showValidationPanel,
  setShowValidationPanel,
  switchToPropertiesPanel
}: UseDesktopPropertiesPanelStateProps) => {
  const [activeTab, setActiveTab] = useState('properties');

  // Smart switching: when user selects a node/edge while validation panel is showing
  useEffect(() => {
    if ((selectedNode || selectedEdge) && showValidationPanel && switchToPropertiesPanel) {
      console.log('🎛️ DesktopPropertiesPanel - Smart switching to properties tab');
      switchToPropertiesPanel();
    }
  }, [selectedNode, selectedEdge, showValidationPanel, switchToPropertiesPanel]);

  // Auto-switch to validation tab when there are issues and user clicks on validation
  useEffect(() => {
    if (showValidationPanel) {
      console.log('🎛️ DesktopPropertiesPanel - Auto-switching to validation tab');
      setActiveTab('validation');
      setShowValidationPanel(false); // Reset the flag
    }
  }, [showValidationPanel, setShowValidationPanel]);

  // Add DOM element verification
  useEffect(() => {
    const element = document.querySelector('[data-panel="desktop-properties"]');
    console.log('🎛️ DesktopPropertiesPanel - DOM element check:', {
      elementExists: !!element,
      element,
      timestamp: new Date().toISOString()
    });
  });

  return {
    activeTab,
    setActiveTab,
  };
};
