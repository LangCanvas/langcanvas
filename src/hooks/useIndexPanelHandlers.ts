
import { useState } from 'react';
import { useEnhancedAnalytics } from './useEnhancedAnalytics';

export const useIndexPanelHandlers = (clearPendingCreation: () => void) => {
  // Mobile states (existing)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'palette' | 'properties' | null>(null);
  const [showValidationPanel, setShowValidationPanel] = useState(false);
  
  // Desktop panel states - both panels should be visible and expanded by default
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(true);
  const [isLeftPanelExpanded, setIsLeftPanelExpanded] = useState(true);
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(true);
  const [isRightPanelExpanded, setIsRightPanelExpanded] = useState(true);
  
  const analytics = useEnhancedAnalytics();

  console.log("🎛️ useIndexPanelHandlers STATE UPDATE:");
  console.log("🎛️ Left panel - visible:", isLeftPanelVisible, "expanded:", isLeftPanelExpanded);
  console.log("🎛️ Right panel - visible:", isRightPanelVisible, "expanded:", isRightPanelExpanded);

  const handleMobileMenuToggle = () => {
    console.log("Mobile menu toggle clicked");
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setActivePanel(null);
    
    analytics.trackFeatureUsage('mobile_menu_toggled', { 
      isOpen: !isMobileMenuOpen 
    });
  };

  const handlePanelToggle = (panel: 'palette' | 'properties') => {
    console.log(`Panel toggle clicked: ${panel}`);
    const newActivePanel = activePanel === panel ? null : panel;
    setActivePanel(newActivePanel);
    
    analytics.trackFeatureUsage('panel_toggled', { 
      panel, 
      isOpen: newActivePanel === panel 
    });
  };

  const handleToggleLeftPanel = () => {
    const newExpanded = !isLeftPanelExpanded;
    console.log("🎛️ Desktop left panel toggle clicked, new expanded state:", newExpanded);
    setIsLeftPanelExpanded(newExpanded);

    analytics.trackFeatureUsage('desktop_left_panel_toggled', { 
      isExpanded: newExpanded 
    });
  };

  const handleToggleRightPanel = () => {
    const newExpanded = !isRightPanelExpanded;
    console.log("🎛️ Desktop right panel toggle clicked, old expanded:", isRightPanelExpanded, "new expanded:", newExpanded);
    setIsRightPanelExpanded(newExpanded);

    analytics.trackFeatureUsage('desktop_right_panel_toggled', { 
      isExpanded: newExpanded 
    });
  };

  const handleExpandLeftPanel = () => {
    console.log("🎛️ Left panel expand requested");
    setIsLeftPanelVisible(true);
    setIsLeftPanelExpanded(true);
    
    analytics.trackFeatureUsage('desktop_left_panel_expanded');
  };

  const handleExpandRightPanel = () => {
    console.log("🎛️ Right panel expand requested");
    setIsRightPanelVisible(true);
    setIsRightPanelExpanded(true);
    
    analytics.trackFeatureUsage('desktop_right_panel_expanded');
  };

  const closePanels = () => {
    console.log("Closing panels");
    setActivePanel(null);
    setIsMobileMenuOpen(false);
    setShowValidationPanel(false);
    clearPendingCreation();
    
    analytics.trackFeatureUsage('panels_closed');
  };

  const switchToPropertiesPanel = () => {
    console.log("Switching to properties panel from validation");
    setShowValidationPanel(false);
    
    analytics.trackFeatureUsage('validation_to_properties_switch');
  };

  return {
    // Mobile states
    isMobileMenuOpen,
    activePanel,
    showValidationPanel,
    setShowValidationPanel,
    handleMobileMenuToggle,
    handlePanelToggle,
    closePanels,
    
    // Desktop panel states
    isLeftPanelVisible,
    isLeftPanelExpanded,
    isRightPanelVisible,
    isRightPanelExpanded,
    handleToggleLeftPanel,
    handleToggleRightPanel,
    handleExpandLeftPanel,
    handleExpandRightPanel,
    switchToPropertiesPanel,
  };
};
