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
  
  // Desktop panel states - load from storage or use defaults
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(storedSettings.isLeftPanelVisible);
  const [isLeftPanelExpanded, setIsLeftPanelExpanded] = useState(storedSettings.isLeftPanelExpanded);
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(storedSettings.isRightPanelVisible);
  const [isRightPanelExpanded, setIsRightPanelExpanded] = useState(storedSettings.isRightPanelExpanded);
  
  // Store the last expanded width for restoration
  const [lastLeftExpandedWidth, setLastLeftExpandedWidth] = useState(256);
  const [lastRightExpandedWidth, setLastRightExpandedWidth] = useState(320);
  
  const analytics = useEnhancedAnalytics();

  // Save panel settings to localStorage whenever they change
  useEffect(() => {
    savePanelSettingsToStorage({
      isLeftPanelVisible,
      isLeftPanelExpanded,
      isRightPanelVisible,
      isRightPanelExpanded,
      leftPanelWidth: storedSettings.leftPanelWidth,
      rightPanelWidth: storedSettings.rightPanelWidth
    });
  }, [isLeftPanelVisible, isLeftPanelExpanded, isRightPanelVisible, isRightPanelExpanded, storedSettings.leftPanelWidth, storedSettings.rightPanelWidth]);

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

  const handleToggleLeftPanel = () => {
    const newExpanded = !isLeftPanelExpanded;
    setIsLeftPanelExpanded(newExpanded);

    // Trigger width change through custom event
    if (newExpanded) {
      // Expanding: restore to last expanded width
      window.dispatchEvent(new CustomEvent('leftPanelResize', { 
        detail: { width: lastLeftExpandedWidth, expanding: true } 
      }));
    } else {
      // Collapsing: set to icon-only width (56px)
      window.dispatchEvent(new CustomEvent('leftPanelResize', { 
        detail: { width: 56, collapsing: true } 
      }));
    }

    analytics.trackFeatureUsage('desktop_left_panel_toggled', { 
      isExpanded: newExpanded 
    });
  };

  const handleToggleRightPanel = () => {
    const newExpanded = !isRightPanelExpanded;
    console.log('🎛️ Right panel toggle handler called. Current expanded:', isRightPanelExpanded, 'New expanded:', newExpanded);
    setIsRightPanelExpanded(newExpanded);

    // Trigger width change through custom event
    if (newExpanded) {
      // Expanding: restore to last expanded width
      window.dispatchEvent(new CustomEvent('rightPanelResize', { 
        detail: { width: lastRightExpandedWidth, expanding: true } 
      }));
    } else {
      // Collapsing: set to icon-only width (56px)
      window.dispatchEvent(new CustomEvent('rightPanelResize', { 
        detail: { width: 56, collapsing: true } 
      }));
    }

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
    console.log('🎛️ Right panel expand handler called');
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
    
    // Width management
    setLastLeftExpandedWidth,
    setLastRightExpandedWidth,
  };
};
