
import { useLeftPanelState } from '../../hooks/useLeftPanelState';
import { useRightPanelState } from '../../hooks/useRightPanelState';

export const useDesktopLayoutLogic = (isLeftPanelVisible: boolean, isRightPanelVisible: boolean) => {
  console.log('🖥️ DesktopLayoutLogic - Initialization');

  // SEPARATE INDEPENDENT PANEL HOOKS
  const {
    leftPanelWidth,
    leftPanelLayout,
    handleLeftPanelResize,
    getMaxPercentageForLeftPanel,
    getMinPercentageForLeftPanel
  } = useLeftPanelState();

  const {
    rightPanelWidth,
    rightPanelLayout,
    handleRightPanelResize,
  } = useRightPanelState();

  console.log('🖥️ DesktopLayoutLogic - Independent panel states:', {
    leftPanelWidth,
    leftPanelLayout,
    rightPanelWidth,
    rightPanelLayout,
    areIndependent: true
  });

  // Conservative sizing for reliable panel visibility
  const leftPanelPercentage = isLeftPanelVisible ? 7 : 0; // Fixed 7% for left panel
  const rightPanelPercentage = isRightPanelVisible ? 20 : 0; // Fixed 20% for right panel  
  const canvasPercentage = 100 - leftPanelPercentage - rightPanelPercentage;

  console.log('🖥️ DesktopLayoutLogic - Panel percentages:', {
    leftPanelPercentage,
    rightPanelPercentage,
    canvasPercentage,
    leftVisible: isLeftPanelVisible,
    rightVisible: isRightPanelVisible
  });

  // Calculate the maximum and minimum percentages for the left panel
  const maxLeftPanelPercentage = getMaxPercentageForLeftPanel();
  const minLeftPanelPercentage = getMinPercentageForLeftPanel();

  console.log('🖥️ DesktopLayoutLogic - Left panel constraints:', {
    maxLeftPanelPercentage,
    minLeftPanelPercentage
  });

  // Log right panel configuration before render
  if (isRightPanelVisible) {
    console.log('🎛️ DesktopLayoutLogic - Right panel config:', {
      defaultSize: rightPanelPercentage,
      minSize: 12,
      maxSize: 35,
      timestamp: new Date().toISOString()
    });
  }

  return {
    leftPanelWidth,
    leftPanelLayout,
    rightPanelWidth,
    rightPanelLayout,
    handleLeftPanelResize,
    handleRightPanelResize,
    leftPanelPercentage,
    rightPanelPercentage,
    canvasPercentage,
  };
};
