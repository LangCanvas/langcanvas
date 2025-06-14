
import { useState, useEffect } from 'react';
import { useEnhancedAnalytics } from './useEnhancedAnalytics';
import { savePanelSettingsToStorage, loadPanelSettingsFromStorage } from '../utils/panelStorage';

export const useIndexPanelHandlers = (clearPendingCreation: () => void) => {
  // Mobile states (existing)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'palette' | 'properties' | 'settings' | null>(null);
  const [showValidationPanel, setShowValidationPanel] = useState(false);
  
  // Load panel settings from localStorage
  const storedSettings = loadPanelSettingsFromStorage();
  
  // Desktop panel states - simplified to just visibility
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(storedSettings.isLeftPanelVisible);
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(storedSettings.isRightPanelVisible);
  
  const analytics = useEnhancedAnalytics();

  // Save panel settings to localStorage whenever they change
  useEffect(() => {
    savePanelSettingsToStorage({
      isLeftPanelVisible,
      isLeftPanelExpanded: true, // Always expanded when visible
      isRightPanelVisible,
      isRightPanelExpanded: true, // Always expanded when visible
      leftPanelWidth: storedSettings.leftPanelWidth,
      rightPanelWidth: storedSettings.rightPanelWidth
    });
  }, [isLeftPanelVisible, isRightPanelVisible, storedSettings.leftPanelWidth, storedSettings.rightPanelWidth]);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setActivePanel(null);
    
    analytics.trackFeatureUsage('mobile_menu_toggled', { 
      isOpen: !isMobileMenuOpen 
    });
  };

  const handlePanelToggle = (panel: 'palette' | 'properties' | 'settings') => {
    const newActivePanel = activePanel === panel ? null : panel;
    setActivePanel(newActivePanel);
    
    analytics.trackFeatureUsage('panel_toggled', { 
      panel, 
      isOpen: newActivePanel === panel 
    });
  };

  const handleShowLeftPanel = () => {
    setIsLeftPanelVisible(true);
    analytics.trackFeatureUsage('desktop_left_panel_shown');
  };

  const handleHideLeftPanel = () => {
    setIsLeftPanelVisible(false);
    analytics.trackFeatureUsage('desktop_left_panel_hidden');
  };

  const handleShowRightPanel = () => {
    setIsRightPanelVisible(true);
    analytics.trackFeatureUsage('desktop_right_panel_shown');
  };

  const handleHideRightPanel = () => {
    setIsRightPanelVisible(false);
    analytics.trackFeatureUsage('desktop_right_panel_hidden');
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
    
    // Desktop panel states - simplified
    isLeftPanelVisible,
    isRightPanelVisible,
    // Removed: isLeftPanelExpanded, isRightPanelExpanded
    // Panels are always expanded when visible, only visibility matters
    isLeftPanelExpanded: isLeftPanelVisible,
    isRightPanelExpanded: isRightPanelVisible,
    
    // Panel control handlers - simplified
    handleShowLeftPanel,
    handleHideLeftPanel,
    handleShowRightPanel,
    handleHideRightPanel,
    // Legacy aliases for compatibility
    handleToggleLeftPanel: () => isLeftPanelVisible ? handleHideLeftPanel() : handleShowLeftPanel(),
    handleToggleRightPanel: () => isRightPanelVisible ? handleHideRightPanel() : handleShowRightPanel(),
    handleExpandLeftPanel: handleShowLeftPanel,
    handleExpandRightPanel: handleShowRightPanel,
    switchToPropertiesPanel,
  };
};
