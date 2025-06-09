
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

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setActivePanel(null);
    
    analytics.trackFeatureUsage('mobile_menu_toggled', { 
      isOpen: !isMobileMenuOpen 
    });
  };

  const handlePanelToggle = (panel: 'palette' | 'properties') => {
    const newActivePanel = activePanel === panel ? null : panel;
    setActivePanel(newActivePanel);
    
    analytics.trackFeatureUsage('panel_toggled', { 
      panel, 
      isOpen: newActivePanel === panel 
    });
  };

  const handleToggleLeftPanel = () => {
    const newExpanded = !isLeftPanelExpanded;
    setIsLeftPanelExpanded(newExpanded);

    analytics.trackFeatureUsage('desktop_left_panel_toggled', { 
      isExpanded: newExpanded 
    });
  };

  const handleToggleRightPanel = () => {
    const newExpanded = !isRightPanelExpanded;
    setIsRightPanelExpanded(newExpanded);

    analytics.trackFeatureUsage('desktop_right_panel_toggled', { 
      isExpanded: newExpanded 
    });
  };

  const handleExpandLeftPanel = () => {
    setIsLeftPanelVisible(true);
    setIsLeftPanelExpanded(true);
    
    analytics.trackFeatureUsage('desktop_left_panel_expanded');
  };

  const handleExpandRightPanel = () => {
    setIsRightPanelVisible(true);
    setIsRightPanelExpanded(true);
    
    analytics.trackFeatureUsage('desktop_right_panel_expanded');
  };

  const closePanels = () => {
    setActivePanel(null);
    setIsMobileMenuOpen(false);
    setShowValidationPanel(false);
    clearPendingCreation();
    
    analytics.trackFeatureUsage('panels_closed');
  };

  const switchToPropertiesPanel = () => {
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
