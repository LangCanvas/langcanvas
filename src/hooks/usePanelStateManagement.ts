
import { useState, useEffect } from 'react';
import { savePanelSettingsToStorage, loadPanelSettingsFromStorage } from '../utils/panelStorage';
import { useAdaptivePanelWidths } from './useAdaptivePanelWidths';

export const usePanelStateManagement = () => {
  console.log('🔧 usePanelStateManagement - Hook initialization started');
  
  // Mobile states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'palette' | 'properties' | 'settings' | null>(null);
  const [showValidationPanel, setShowValidationPanel] = useState(false);
  
  // Get actual panel widths from the adaptive panel widths hook
  const { leftPanelWidth, rightPanelWidth } = useAdaptivePanelWidths();
  console.log('🔧 usePanelStateManagement - Panel widths from adaptive hook:', { leftPanelWidth, rightPanelWidth });
  
  // SIMPLIFIED: Properties Panel is ALWAYS visible by default
  // This ensures new users, incognito mode, and corrupted storage all see the panel
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(true);
  console.log('🔧 usePanelStateManagement - Initial right panel state set to:', true);

  // Load panel settings and apply them AFTER initialization
  useEffect(() => {
    console.log('🔧 usePanelStateManagement - Storage loading effect triggered');
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
      
      console.log('✅ Properties Panel - Final visible state after storage loading:', isRightPanelVisible);
    } catch (error) {
      console.warn('⚠️ Properties Panel - Failed to load settings, keeping default visible state:', error);
      // Panel remains visible (default state)
    }
  }, []);

  // Enhanced panel settings saving with error handling
  useEffect(() => {
    console.log('🔧 usePanelStateManagement - Panel settings save effect triggered');
    console.log('🔧 Panel settings to save:', {
      isRightPanelVisible,
      leftPanelWidth,
      rightPanelWidth
    });
    
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
      console.log('🔧 DOM Panel Check:', {
        expectedVisible: isRightPanelVisible,
        panelExistsInDOM: !!rightPanel,
        panelElement: rightPanel
      });
      
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

  return {
    // Mobile states
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    activePanel,
    setActivePanel,
    showValidationPanel,
    setShowValidationPanel,
    
    // Desktop panel states
    isRightPanelVisible,
    setIsRightPanelVisible,
  };
};
