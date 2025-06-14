
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

  // DEBUG: Monitor right panel visibility changes
  useEffect(() => {
    console.log('🚨 DEBUG - Right panel visibility changed:', {
      isRightPanelVisible,
      timestamp: new Date().toISOString(),
      stackTrace: new Error().stack
    });
  }, [isRightPanelVisible]);

  // DEBUG: Monitor localStorage content
  useEffect(() => {
    const interval = setInterval(() => {
      const stored = localStorage.getItem('langcanvas_panel_settings');
      console.log('🚨 DEBUG - Current localStorage content:', {
        rawValue: stored,
        parsed: stored ? JSON.parse(stored) : null,
        timestamp: new Date().toISOString()
      });
    }, 5000); // Log every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Load panel settings and apply them AFTER initialization
  useEffect(() => {
    console.log('🔧 usePanelStateManagement - Storage loading effect triggered');
    console.log('🚨 DEBUG - Before loading settings - current state:', { isRightPanelVisible });
    
    try {
      const settings = loadPanelSettingsFromStorage();
      console.log('🔍 Properties Panel - Loading stored settings:', settings);
      console.log('🚨 DEBUG - Settings loaded from storage:', JSON.stringify(settings, null, 2));
      
      // Only hide the panel if explicitly stored as false by user preference
      const shouldHidePanel = settings.isRightPanelVisible === false;
      
      console.log('🔍 Properties Panel - Should hide panel:', shouldHidePanel);
      console.log('🔍 Properties Panel - Current visible state:', isRightPanelVisible);
      console.log('🚨 DEBUG - Analysis:', {
        settingsValue: settings.isRightPanelVisible,
        shouldHidePanel,
        currentState: isRightPanelVisible,
        willChange: shouldHidePanel !== !isRightPanelVisible
      });
      
      if (shouldHidePanel && isRightPanelVisible) {
        console.log('👁️ Properties Panel - Applying user preference: hiding panel');
        console.log('🚨 DEBUG - CHANGING STATE TO FALSE');
        setIsRightPanelVisible(false);
      } else if (!shouldHidePanel && !isRightPanelVisible) {
        console.log('👁️ Properties Panel - Ensuring panel is visible (default behavior)');
        console.log('🚨 DEBUG - CHANGING STATE TO TRUE');
        setIsRightPanelVisible(true);
      } else {
        console.log('🚨 DEBUG - NO STATE CHANGE NEEDED');
      }
      
      console.log('✅ Properties Panel - Final visible state after storage loading:', isRightPanelVisible);
    } catch (error) {
      console.warn('⚠️ Properties Panel - Failed to load settings, keeping default visible state:', error);
      console.log('🚨 DEBUG - Error during loading, state remains:', isRightPanelVisible);
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
    console.log('🚨 DEBUG - Saving panel settings with right panel visible:', isRightPanelVisible);
    
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
      console.log('🚨 DEBUG - Settings saved to localStorage');
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
      console.log('🚨 DEBUG - DOM Panel inspection:', {
        panelFound: !!rightPanel,
        panelDisplayStyle: rightPanel ? window.getComputedStyle(rightPanel).display : 'not found',
        panelVisibilityStyle: rightPanel ? window.getComputedStyle(rightPanel).visibility : 'not found',
        panelWidth: rightPanel ? window.getComputedStyle(rightPanel).width : 'not found'
      });
      
      if (!isRightPanelVisible && rightPanel) {
        console.log('🔧 Properties Panel - Visibility mismatch detected, panel exists but state says hidden');
        console.log('🚨 DEBUG - MISMATCH: Panel in DOM but state is false');
      } else if (isRightPanelVisible && !rightPanel) {
        console.log('🔧 Properties Panel - Visibility mismatch detected, panel should be visible but not found in DOM');
        console.log('🚨 DEBUG - MISMATCH: State is true but panel not in DOM');
      } else if (isRightPanelVisible && rightPanel) {
        console.log('✅ Properties Panel - Visibility state and DOM are in sync (visible)');
        console.log('🚨 DEBUG - SYNC: Both state and DOM show visible');
      } else {
        console.log('✅ Properties Panel - Visibility state and DOM are in sync (hidden by user preference)');
        console.log('🚨 DEBUG - SYNC: Both state and DOM show hidden');
      }
    };

    // Check after a brief delay to allow DOM updates
    const timeoutId = setTimeout(checkPanelVisibility, 100);
    return () => clearTimeout(timeoutId);
  }, [isRightPanelVisible]);

  // DEBUG: Add global debugging functions
  useEffect(() => {
    (window as any).debugRightPanel = {
      getCurrentState: () => ({
        isRightPanelVisible,
        localStorage: localStorage.getItem('langcanvas_panel_settings'),
        domElement: document.querySelector('[data-panel="desktop-properties"]')
      }),
      forceShow: () => {
        console.log('🚨 DEBUG - Force showing right panel');
        setIsRightPanelVisible(true);
      },
      forceHide: () => {
        console.log('🚨 DEBUG - Force hiding right panel');
        setIsRightPanelVisible(false);
      },
      clearStorage: () => {
        console.log('🚨 DEBUG - Clearing panel storage');
        localStorage.removeItem('langcanvas_panel_settings');
      }
    };

    return () => {
      delete (window as any).debugRightPanel;
    };
  }, [isRightPanelVisible]);

  const returnValue = {
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

  console.log('🚨 DEBUG - usePanelStateManagement returning:', {
    isRightPanelVisible: returnValue.isRightPanelVisible,
    timestamp: new Date().toISOString()
  });

  return returnValue;
};
