
import { useState } from 'react';
import { useEnhancedAnalytics } from './useEnhancedAnalytics';

export const useIndexPanelHandlers = (clearPendingCreation: () => void) => {
  // Mobile states (existing)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'palette' | 'properties' | null>(null);
  const [showValidationPanel, setShowValidationPanel] = useState(false);
  
  // Desktop panel states (new)
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(true);
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(true);
  
  const analytics = useEnhancedAnalytics();

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
    console.log("Desktop left panel toggle clicked");
    setIsLeftPanelVisible(!isLeftPanelVisible);
    
    analytics.trackFeatureUsage('desktop_left_panel_toggled', { 
      isVisible: !isLeftPanelVisible 
    });
  };

  const handleToggleRightPanel = () => {
    console.log("Desktop right panel toggle clicked");
    setIsRightPanelVisible(!isRightPanelVisible);
    
    analytics.trackFeatureUsage('desktop_right_panel_toggled', { 
      isVisible: !isRightPanelVisible 
    });
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
    isRightPanelVisible,
    handleToggleLeftPanel,
    handleToggleRightPanel,
    switchToPropertiesPanel,
  };
};
