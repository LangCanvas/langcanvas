
import { useState, useCallback } from 'react';

// Updated panel breakpoints with new minimum constraint
export const PANEL_BREAKPOINTS = {
  MIN: 50, // Updated minimum for small layout (reduced from 60px to 50px)
  SWITCH_THRESHOLD: 70, // Switch to medium layout threshold (reduced from 90px to 70px)
  MAX: 100, // Maximum for medium layout to keep it compact
  DEFAULT_LEFT: 95,
  DEFAULT_RIGHT: 320
} as const;

export type PanelLayout = 'small' | 'medium';

export const useAdaptivePanelWidths = () => {
  const getInitialLeftWidth = useCallback(() => {
    if (typeof window !== 'undefined') {
      return Math.max(PANEL_BREAKPOINTS.MIN, Math.min(PANEL_BREAKPOINTS.MAX, window.innerWidth * 0.15));
    }
    return PANEL_BREAKPOINTS.DEFAULT_LEFT;
  }, []);

  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(() => getInitialLeftWidth());
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(PANEL_BREAKPOINTS.DEFAULT_RIGHT);

  const getInitialPercentage = useCallback((pixelWidth: number, isVisible: boolean) => {
    if (!isVisible) return 0;
    const referenceWidth = 1400;
    return Math.max(4, Math.min(35, (pixelWidth / referenceWidth) * 100));
  }, []);

  const convertPercentageToPixels = useCallback((percentage: number) => {
    const referenceWidth = 1400;
    return Math.round((percentage / 100) * referenceWidth);
  }, []);

  // Calculate the maximum percentage that represents 100px
  const getMaxPercentageForLeftPanel = useCallback(() => {
    const referenceWidth = 1400;
    return (PANEL_BREAKPOINTS.MAX / referenceWidth) * 100;
  }, []);

  // Calculate the minimum percentage that represents 80px
  const getMinPercentageForLeftPanel = useCallback(() => {
    const referenceWidth = 1400;
    return (PANEL_BREAKPOINTS.MIN / referenceWidth) * 100;
  }, []);

  const handleLeftPanelResize = useCallback((percentage: number) => {
    // Cap the percentage to ensure it doesn't exceed 100px equivalent
    const maxPercentage = getMaxPercentageForLeftPanel();
    const cappedPercentage = Math.min(percentage, maxPercentage);
    
    const pixelWidth = convertPercentageToPixels(cappedPercentage);
    // Enforce strict width constraints for left panel
    const constrainedWidth = Math.max(PANEL_BREAKPOINTS.MIN, Math.min(PANEL_BREAKPOINTS.MAX, pixelWidth));
    setLeftPanelWidth(constrainedWidth);
  }, [convertPercentageToPixels, getMaxPercentageForLeftPanel]);

  const handleRightPanelResize = useCallback((percentage: number) => {
    const pixelWidth = convertPercentageToPixels(percentage);
    const constrainedWidth = Math.max(PANEL_BREAKPOINTS.MIN, Math.min(500, pixelWidth));
    setRightPanelWidth(constrainedWidth);
  }, [convertPercentageToPixels]);

  // Independent layout calculation for left panel
  const getLeftPanelLayout = useCallback((): PanelLayout => {
    return leftPanelWidth >= PANEL_BREAKPOINTS.SWITCH_THRESHOLD ? 'medium' : 'small';
  }, [leftPanelWidth]);

  // Independent layout calculation for right panel
  const getRightPanelLayout = useCallback((): PanelLayout => {
    // Using same threshold for consistency, but could have its own if needed
    return rightPanelWidth >= PANEL_BREAKPOINTS.SWITCH_THRESHOLD ? 'medium' : 'small';
  }, [rightPanelWidth]);

  return {
    leftPanelWidth,
    rightPanelWidth,
    leftPanelLayout: getLeftPanelLayout(),
    rightPanelLayout: getRightPanelLayout(),
    handleLeftPanelResize,
    handleRightPanelResize,
    getInitialPercentage,
    getMaxPercentageForLeftPanel,
    getMinPercentageForLeftPanel,
    measurements: {}, // Empty measurements object for backward compatibility
  };
};
