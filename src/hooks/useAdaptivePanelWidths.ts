
import { useState, useCallback, useRef, useEffect } from 'react';
import { useSmartPanelSizing } from './useSmartPanelSizing';

// Updated panel breakpoints with new constraints
export const PANEL_BREAKPOINTS = {
  MIN: 80, // Updated minimum for small layout (icon + text)
  SWITCH_THRESHOLD: 90, // Updated switch to medium layout threshold
  MAX: 100, // Maximum for medium layout to keep it compact
  DEFAULT_LEFT: 95,
  DEFAULT_RIGHT: 320
} as const;

export type PanelLayout = 'small' | 'medium';

export const useAdaptivePanelWidths = () => {
  const { measurements, getContentBasedLayout } = useSmartPanelSizing();
  
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

  const getLeftPanelLayout = useCallback((): PanelLayout => {
    return getContentBasedLayout(leftPanelWidth);
  }, [leftPanelWidth, getContentBasedLayout]);

  const getRightPanelLayout = useCallback((): PanelLayout => {
    // Use the same logic for consistency
    return getContentBasedLayout(leftPanelWidth);
  }, [leftPanelWidth, getContentBasedLayout]);

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
    measurements,
  };
};
