
import { useState, useCallback } from 'react';

// Left panel specific breakpoints
export const LEFT_PANEL_BREAKPOINTS = {
  MIN: 50, // Minimum width for small layout
  SWITCH_THRESHOLD: 70, // Switch to medium layout threshold
  MAX: 100, // Maximum for medium layout
  DEFAULT: 95
} as const;

export type LeftPanelLayout = 'small' | 'medium';

export const useLeftPanelState = () => {
  const getInitialLeftWidth = useCallback(() => {
    if (typeof window !== 'undefined') {
      return Math.max(LEFT_PANEL_BREAKPOINTS.MIN, Math.min(LEFT_PANEL_BREAKPOINTS.MAX, window.innerWidth * 0.15));
    }
    return LEFT_PANEL_BREAKPOINTS.DEFAULT;
  }, []);

  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(() => getInitialLeftWidth());

  const convertPercentageToPixels = useCallback((percentage: number) => {
    const referenceWidth = 1400;
    return Math.round((percentage / 100) * referenceWidth);
  }, []);

  // Calculate the maximum percentage that represents 100px
  const getMaxPercentageForLeftPanel = useCallback(() => {
    const referenceWidth = 1400;
    return (LEFT_PANEL_BREAKPOINTS.MAX / referenceWidth) * 100;
  }, []);

  // Calculate the minimum percentage that represents 50px
  const getMinPercentageForLeftPanel = useCallback(() => {
    const referenceWidth = 1400;
    return (LEFT_PANEL_BREAKPOINTS.MIN / referenceWidth) * 100;
  }, []);

  const handleLeftPanelResize = useCallback((percentage: number) => {
    console.log('🎛️ useLeftPanelState - Resize triggered:', { percentage });
    
    // Cap the percentage to ensure it doesn't exceed 100px equivalent
    const maxPercentage = getMaxPercentageForLeftPanel();
    const cappedPercentage = Math.min(percentage, maxPercentage);
    
    const pixelWidth = convertPercentageToPixels(cappedPercentage);
    // Enforce strict width constraints for left panel
    const constrainedWidth = Math.max(LEFT_PANEL_BREAKPOINTS.MIN, Math.min(LEFT_PANEL_BREAKPOINTS.MAX, pixelWidth));
    
    console.log('🎛️ useLeftPanelState - Width calculation:', {
      percentage,
      cappedPercentage,
      pixelWidth,
      constrainedWidth,
      oldWidth: leftPanelWidth
    });
    
    setLeftPanelWidth(constrainedWidth);
  }, [convertPercentageToPixels, getMaxPercentageForLeftPanel, leftPanelWidth]);

  // INDEPENDENT layout calculation - no external dependencies
  const getLeftPanelLayout = useCallback((): LeftPanelLayout => {
    // Direct comparison with our own breakpoint
    const layout = leftPanelWidth >= LEFT_PANEL_BREAKPOINTS.SWITCH_THRESHOLD ? 'medium' : 'small';
    console.log('🎛️ useLeftPanelState - INDEPENDENT Layout calculation:', {
      leftPanelWidth,
      layout,
      threshold: LEFT_PANEL_BREAKPOINTS.SWITCH_THRESHOLD,
      isIndependent: true
    });
    return layout;
  }, [leftPanelWidth]);

  const layout = getLeftPanelLayout();

  console.log('🎛️ useLeftPanelState - Current INDEPENDENT state:', {
    leftPanelWidth,
    layout,
    min: LEFT_PANEL_BREAKPOINTS.MIN,
    max: LEFT_PANEL_BREAKPOINTS.MAX,
    switchThreshold: LEFT_PANEL_BREAKPOINTS.SWITCH_THRESHOLD,
    isIndependent: true
  });

  return {
    leftPanelWidth,
    leftPanelLayout: layout,
    handleLeftPanelResize,
    getMaxPercentageForLeftPanel,
    getMinPercentageForLeftPanel,
  };
};
