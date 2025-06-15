
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

  // Dynamic sizing based on actual panel requirements
  const leftPanelPercentage = isLeftPanelVisible ? Math.max(5, getMinPercentageForLeftPanel()) : 0;
  const rightPanelPercentage = isRightPanelVisible ? 20 : 0; // Keep right panel fixed for now
  const canvasPercentage = 100 - leftPanelPercentage - rightPanelPercentage;

  console.log('🖥️ DesktopLayoutLogic - Dynamic panel percentages:', {
    leftPanelPercentage,
    rightPanelPercentage,
    canvasPercentage,
    leftVisible: isLeftPanelVisible,
    rightVisible: isRightPanelVisible,
    leftPanelActualWidth: leftPanelWidth
  });

  // Calculate the maximum and minimum percentages for the left panel
  const maxLeftPanelPercentage = getMaxPercentageForLeftPanel();
  const minLeftPanelPercentage = getMinPercentageForLeftPanel();

  console.log('🖥️ DesktopLayoutLogic - Left panel constraints (updated):', {
    maxLeftPanelPercentage,
    minLeftPanelPercentage,
    allowedRange: `${minLeftPanelPercentage.toFixed(1)}% - ${maxLeftPanelPercentage.toFixed(1)}%`
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
