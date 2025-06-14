
import { useState, useEffect } from 'react';
import { useEnhancedAnalytics } from './useEnhancedAnalytics';
import { savePanelSettingsToStorage, loadPanelSettingsFromStorage } from '../utils/panelStorage';
import { useAdaptivePanelWidths } from './useAdaptivePanelWidths';

export const useIndexPanelHandlers = (clearPendingCreation: () => void) => {
  // Mobile states (existing)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'palette' | 'properties' | 'settings' | null>(null);
  const [showValidationPanel, setShowValidationPanel] = useState(false);
  
  // Get actual panel widths from the adaptive panel widths hook
  const { leftPanelWidth, rightPanelWidth } = useAdaptivePanelWidths();
  
  // Load panel settings from localStorage
  const storedSettings = loadPanelSettingsFromStorage();
  
  // Desktop panel states - left panel is ALWAYS visible, only right panel can be toggled
  const [isLeftPanelVisible] = useState(true); // Always true, no setter needed
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(storedSettings.isRightPanelVisible);
  
  const analytics = useEnhancedAnalytics();

  // Save panel settings to localStorage whenever they change, including actual widths
  useEffect(() => {
    savePanelSettingsToStorage({
      isLeftPanelVisible: true, // Always true
      isLeftPanelExpanded: true, // Always expanded when visible
      isRightPanelVisible,
      isRightPanelExpanded: true, // Always expanded when visible
      leftPanelWidth, // Use actual width from adaptive panel widths
      rightPanelWidth // Use actual width from adaptive panel widths
    });
  }, [isRightPanelVisible, leftPanelWidth, rightPanelWidth]);

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

  // Left panel handlers - simplified since it's always visible
  const handleShowLeftPanel = () => {
    // No-op since left panel is always visible
    analytics.trackFeatureUsage('desktop_left_panel_show_attempted');
  };

  const handleHideLeftPanel = () => {
    // No-op since left panel cannot be hidden
    console.log('🚫 Left panel cannot be hidden - always visible');
    analytics.trackFeatureUsage('desktop_left_panel_hide_attempted');
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
    
    // Desktop panel states - left panel always visible
    isLeftPanelVisible: true, // Always true
    isRightPanelVisible,
    // Panels are always expanded when visible
    isLeftPanelExpanded: true, // Always true
    isRightPanelExpanded: isRightPanelVisible,
    
    // Panel control handlers
    handleShowLeftPanel,
    handleHideLeftPanel,
    handleShowRightPanel,
    handleHideRightPanel,
    // Legacy aliases for compatibility - left panel handlers are no-ops
    handleToggleLeftPanel: () => {
      console.log('🚫 Left panel toggle disabled - always visible');
    },
    handleToggleRightPanel: () => isRightPanelVisible ? handleHideRightPanel() : handleShowRightPanel(),
    handleExpandLeftPanel: handleShowLeftPanel, // No-op
    handleExpandRightPanel: handleShowRightPanel,
    switchToPropertiesPanel,
  };
};
