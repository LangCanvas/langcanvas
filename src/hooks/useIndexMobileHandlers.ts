
import { useState } from 'react';
import { useEnhancedAnalytics } from './useEnhancedAnalytics';

export const useIndexMobileHandlers = (clearPendingCreation: () => void) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'palette' | 'properties' | null>(null);
  const [showValidationPanel, setShowValidationPanel] = useState(false);
  
  const analytics = useEnhancedAnalytics();

  const handleMobileMenuToggle = () => {
    console.log("Mobile menu toggle clicked");
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setActivePanel(null);
    
    // Track mobile menu usage
    analytics.trackFeatureUsage('mobile_menu_toggled', { 
      isOpen: !isMobileMenuOpen 
    });
  };

  const handlePanelToggle = (panel: 'palette' | 'properties') => {
    console.log(`Panel toggle clicked: ${panel}`);
    const newActivePanel = activePanel === panel ? null : panel;
    setActivePanel(newActivePanel);
    
    // Track panel usage
    analytics.trackFeatureUsage('panel_toggled', { 
      panel, 
      isOpen: newActivePanel === panel 
    });
  };

  const closePanels = () => {
    console.log("Closing panels");
    setActivePanel(null);
    setIsMobileMenuOpen(false);
    setShowValidationPanel(false);
    clearPendingCreation();
    
    // Track panel closure
    analytics.trackFeatureUsage('panels_closed');
  };

  return {
    isMobileMenuOpen,
    activePanel,
    showValidationPanel,
    setShowValidationPanel,
    handleMobileMenuToggle,
    handlePanelToggle,
    closePanels,
  };
};
