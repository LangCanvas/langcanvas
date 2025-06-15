
import { useState, useEffect } from 'react';
import { savePanelSettingsToStorage, loadPanelSettingsFromStorage } from '../utils/panelStorage';
import { useLeftPanelState } from './useLeftPanelState';
import { useRightPanelState } from './useRightPanelState';

export const usePanelStateManagement = () => {
  console.log('🔧 usePanelStateManagement - Hook initialization started');
  
  // Mobile states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'palette' | 'properties' | 'settings' | null>(null);
  const [showValidationPanel, setShowValidationPanel] = useState(false);
  
  // Get actual panel widths from the independent panel hooks
  const { leftPanelWidth } = useLeftPanelState();
  const { rightPanelWidth } = useRightPanelState();
  console.log('🔧 usePanelStateManagement - Panel widths from independent hooks:', { leftPanelWidth, rightPanelWidth });
  
  // SIMPLIFIED: Load initial state from storage synchronously
  const getInitialRightPanelState = () => {
    try {
      const settings = loadPanelSettingsFromStorage();
      console.log('🔧 usePanelStateManagement - Loaded settings:', settings);
      // Default to visible unless explicitly set to false
      return settings.isRightPanelVisible !== false;
    } catch (error) {
      console.warn('🔧 usePanelStateManagement - Error loading settings, defaulting to visible:', error);
      return true; // Default to visible
    }
  };

  const [isRightPanelVisible, setIsRightPanelVisible] = useState(getInitialRightPanelState);
  console.log('🔧 usePanelStateManagement - Initial right panel state:', isRightPanelVisible);

  // DEBUG: Monitor right panel visibility changes
  useEffect(() => {
    console.log('🚨 DEBUG - Right panel visibility changed:', {
      isRightPanelVisible,
      timestamp: new Date().toISOString(),
      stackTrace: new Error().stack?.split('\n').slice(0, 5).join('\n')
    });
  }, [isRightPanelVisible]);

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
