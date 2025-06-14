
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
  
  // Load panel settings from localStorage with enhanced error handling
  const loadStoredSettings = () => {
    try {
      const settings = loadPanelSettingsFromStorage();
      console.log('📂 Panel settings loaded:', settings);
      return settings;
    } catch (error) {
      console.warn('⚠️ Failed to load panel settings, using defaults:', error);
      return {
        isLeftPanelVisible: true,
        isLeftPanelExpanded: true,
        isRightPanelVisible: true, // Force default to true
        isRightPanelExpanded: true,
        leftPanelWidth: 95,
        rightPanelWidth: 320
      };
    }
  };
  
  const storedSettings = loadStoredSettings();
  
  // Desktop panel states - left panel is ALWAYS visible, right panel defaults to visible
  const [isLeftPanelVisible] = useState(true); // Always true, no setter needed
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(() => {
    // ROBUST DEFAULT LOGIC: Always default to visible unless explicitly disabled
    // This ensures new users and users with corrupted storage see the panel
    const shouldBeVisible = storedSettings.isRightPanelVisible !== false;
    
    if (!shouldBeVisible) {
      console.log('🔍 Properties Panel initialized as hidden (user preference)');
    } else {
      console.log('✅ Properties Panel initialized as visible (default behavior)');
    }
    
    return shouldBeVisible;
  });
  
  const analytics = useEnhancedAnalytics();

  // Enhanced panel settings saving with error handling
  useEffect(() => {
    try {
      savePanelSettingsToStorage({
        isLeftPanelVisible: true, // Always true
        isLeftPanelExpanded: true, // Always expanded when visible
        isRightPanelVisible,
        isRightPanelExpanded: true, // Always expanded when visible
        leftPanelWidth, // Use actual width from adaptive panel widths
        rightPanelWidth // Use actual width from adaptive panel widths
      });
      console.log('💾 Panel settings saved successfully');
    } catch (error) {
      console.warn('⚠️ Failed to save panel settings:', error);
    }
  }, [isRightPanelVisible, leftPanelWidth, rightPanelWidth]);

  // Safeguard: Runtime check to ensure panel visibility is maintained
  useEffect(() => {
    const checkPanelVisibility = () => {
      const rightPanel = document.querySelector('[data-panel="desktop-properties"]');
      if (!isRightPanelVisible && rightPanel) {
        console.log('🔧 Panel visibility mismatch detected - panel exists but state says hidden');
      } else if (isRightPanelVisible && !rightPanel) {
        console.log('🔧 Panel visibility mismatch detected - panel should be visible but not found in DOM');
      }
    };

    // Check after a brief delay to allow DOM updates
    const timeoutId = setTimeout(checkPanelVisibility, 100);
    return () => clearTimeout(timeoutId);
  }, [isRightPanelVisible]);

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
    console.log('👁️ Showing Properties Panel');
    setIsRightPanelVisible(true);
    analytics.trackFeatureUsage('desktop_right_panel_shown');
  };

  const handleHideRightPanel = () => {
    console.log('🙈 Hiding Properties Panel');
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
    
    // Desktop panel states - left panel always visible, right panel toggleable
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
