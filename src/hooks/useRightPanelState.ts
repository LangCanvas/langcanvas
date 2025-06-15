import { useState, useCallback } from 'react';
import { PanelLayout } from '../types/panelTypes';

// Right panel specific breakpoints
export const RIGHT_PANEL_BREAKPOINTS = {
  MIN: 200, // Minimum width
  MAX: 500, // Maximum width
  DEFAULT: 320
} as const;

export type RightPanelLayout = PanelLayout;

export const useRightPanelState = () => {
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(RIGHT_PANEL_BREAKPOINTS.DEFAULT);

  const convertPercentageToPixels = useCallback((percentage: number) => {
    const referenceWidth = 1400;
    return Math.round((percentage / 100) * referenceWidth);
  }, []);

  const handleRightPanelResize = useCallback((percentage: number) => {
    console.log('🎛️ useRightPanelState - Resize triggered:', { percentage });
    
    const pixelWidth = convertPercentageToPixels(percentage);
    const constrainedWidth = Math.max(RIGHT_PANEL_BREAKPOINTS.MIN, Math.min(RIGHT_PANEL_BREAKPOINTS.MAX, pixelWidth));
    
    console.log('🎛️ useRightPanelState - Width calculation:', {
      percentage,
      pixelWidth,
      constrainedWidth,
      oldWidth: rightPanelWidth
    });
    
    setRightPanelWidth(constrainedWidth);
  }, [convertPercentageToPixels, rightPanelWidth]);

  const getRightPanelLayout = useCallback((): RightPanelLayout => {
    // Independent layout calculation based on right panel width
    const layout = rightPanelWidth <= 280 ? 'small' : 'medium';
    console.log('🎛️ useRightPanelState - Layout calculation:', {
      rightPanelWidth,
      layout,
      threshold: 280
    });
    return layout;
  }, [rightPanelWidth]);

  const layout = getRightPanelLayout();

  console.log('🎛️ useRightPanelState - Current state:', {
    rightPanelWidth,
    layout,
    min: RIGHT_PANEL_BREAKPOINTS.MIN,
    max: RIGHT_PANEL_BREAKPOINTS.MAX
  });

  return {
    rightPanelWidth,
    rightPanelLayout: layout,
    handleRightPanelResize,
  };
};
