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
  
  // SIMPLIFIED: Properties Panel is ALWAYS visible by default
  // This ensures new users, incognito mode, and corrupted storage all see the panel
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(true);
  
  const analytics = useEnhancedAnalytics();

  // Load panel settings and apply them AFTER initialization
  useEffect(() => {
    try {
      const settings = loadPanelSettingsFromStorage();
      console.log('🔍 Properties Panel - Loading stored settings:', settings);
      
      // Only hide the panel if explicitly stored as false by user preference
      const shouldHidePanel = settings.isRightPanelVisible === false;
      
      console.log('🔍 Properties Panel - Should hide panel:', shouldHidePanel);
      console.log('🔍 Properties Panel - Current visible state:', isRightPanelVisible);
      
      if (shouldHidePanel && isRightPanelVisible) {
        console.log('👁️ Properties Panel - Applying user preference: hiding panel');
        setIsRightPanelVisible(false);
      } else if (!shouldHidePanel && !isRightPanelVisible) {
        console.log('👁️ Properties Panel - Ensuring panel is visible (default behavior)');
        setIsRightPanelVisible(true);
      }
      
      console.log('✅ Properties Panel - Final visible state:', isRightPanelVisible);
    } catch (error) {
      console.warn('⚠️ Properties Panel - Failed to load settings, keeping default visible state:', error);
      // Panel remains visible (default state)
    }
  }, []);

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
      console.log('💾 Panel settings saved successfully - Right panel visible:', isRightPanelVisible);
    } catch (error) {
      console.warn('⚠️ Failed to save panel settings:', error);
    }
  }, [isRightPanelVisible, leftPanelWidth, rightPanelWidth]);

  // Debug logging for panel visibility state changes
  useEffect(() => {
    console.log('🔍 Properties Panel - Visibility state changed:', {
      isRightPanelVisible,
      timestamp: new Date().toISOString(),
      localStorage: localStorage.getItem('langcanvas_panel_settings')
    });
  }, [isRightPanelVisible]);

  // Runtime safeguard: Force panel visible if it should be but isn't
  useEffect(() => {
    const checkPanelVisibility = () => {
      const rightPanel = document.querySelector('[data-panel="desktop-properties"]');
      if (!isRightPanelVisible && rightPanel) {
        console.log('🔧 Properties Panel - Visibility mismatch detected, panel exists but state says hidden');
      } else if (isRightPanelVisible && !rightPanel) {
        console.log('🔧 Properties Panel - Visibility mismatch detected, panel should be visible but not found in DOM');
      } else if (isRightPanelVisible && rightPanel) {
        console.log('✅ Properties Panel - Visibility state and DOM are in sync (visible)');
      } else {
        console.log('✅ Properties Panel - Visibility state and DOM are in sync (hidden by user preference)');
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
    console.log('👁️ Properties Panel - User requested to show panel');
    setIsRightPanelVisible(true);
    analytics.trackFeatureUsage('desktop_right_panel_shown');
  };

  const handleHideRightPanel = () => {
    console.log('🙈 Properties Panel - User requested to hide panel');
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
