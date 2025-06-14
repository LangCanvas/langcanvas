
import { useEnhancedAnalytics } from './useEnhancedAnalytics';

interface UsePanelActionHandlersProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  activePanel: 'palette' | 'properties' | 'settings' | null;
  setActivePanel: (panel: 'palette' | 'properties' | 'settings' | null) => void;
  setShowValidationPanel: (show: boolean) => void;
  isRightPanelVisible: boolean;
  setIsRightPanelVisible: (visible: boolean) => void;
  clearPendingCreation: () => void;
}

export const usePanelActionHandlers = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  activePanel,
  setActivePanel,
  setShowValidationPanel,
  isRightPanelVisible,
  setIsRightPanelVisible,
  clearPendingCreation,
}: UsePanelActionHandlersProps) => {
  const analytics = useEnhancedAnalytics();

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
    handleMobileMenuToggle,
    handlePanelToggle,
    handleShowLeftPanel,
    handleHideLeftPanel,
    handleShowRightPanel,
    handleHideRightPanel,
    closePanels,
    switchToPropertiesPanel,
    // Legacy aliases for compatibility - left panel handlers are no-ops
    handleToggleLeftPanel: () => {
      console.log('🚫 Left panel toggle disabled - always visible');
    },
    handleToggleRightPanel: () => isRightPanelVisible ? handleHideRightPanel() : handleShowRightPanel(),
    handleExpandLeftPanel: handleShowLeftPanel, // No-op
    handleExpandRightPanel: handleShowRightPanel,
  };
};
