
import { usePanelStateManagement } from './usePanelStateManagement';
import { usePanelActionHandlers } from './usePanelActionHandlers';

export const useIndexPanelHandlers = (clearPendingCreation: () => void) => {
  console.log('🔧 useIndexPanelHandlers - Hook initialization started');
  
  const {
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    activePanel,
    setActivePanel,
    showValidationPanel,
    setShowValidationPanel,
    isRightPanelVisible,
    setIsRightPanelVisible,
  } = usePanelStateManagement();

  console.log('🚨 DEBUG - useIndexPanelHandlers received from usePanelStateManagement:', {
    isRightPanelVisible,
    timestamp: new Date().toISOString()
  });

  const handlers = usePanelActionHandlers({
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    activePanel,
    setActivePanel,
    setShowValidationPanel,
    isRightPanelVisible,
    setIsRightPanelVisible,
    clearPendingCreation,
  });

  const returnValues = {
    // Mobile states
    isMobileMenuOpen,
    activePanel,
    showValidationPanel,
    setShowValidationPanel,
    
    // Desktop panel states - left panel always visible, right panel toggleable
    isLeftPanelVisible: true, // Always true
    isRightPanelVisible,
    // Panels are always expanded when visible
    isLeftPanelExpanded: true, // Always true
    isRightPanelExpanded: isRightPanelVisible,
    
    // All handlers
    ...handlers,
  };

  console.log('🔧 useIndexPanelHandlers - Returning values:', {
    isLeftPanelVisible: returnValues.isLeftPanelVisible,
    isRightPanelVisible: returnValues.isRightPanelVisible,
    isLeftPanelExpanded: returnValues.isLeftPanelExpanded,
    isRightPanelExpanded: returnValues.isRightPanelExpanded
  });

  console.log('🚨 DEBUG - useIndexPanelHandlers final return values:', {
    isRightPanelVisible: returnValues.isRightPanelVisible,
    isRightPanelExpanded: returnValues.isRightPanelExpanded,
    timestamp: new Date().toISOString()
  });

  return returnValues;
};
