
import { useState, useCallback, useRef, useEffect } from 'react';
import { useSmartPanelSizing } from './useSmartPanelSizing';

export const PANEL_BREAKPOINTS = {
  MIN: 200,
  DEFAULT_LEFT: 256,
  DEFAULT_RIGHT: 320,
  MAX: 500
} as const;

export type PanelLayout = 'ultra-compact' | 'compact' | 'standard' | 'wide';

interface PanelWidthSettings {
  leftPanelWidth: number;
  rightPanelWidth: number;
  version: string;
  timestamp: number;
}

const PANEL_WIDTH_STORAGE_KEY = 'langcanvas_panel_widths';
const PANEL_WIDTH_VERSION = '2.0';

export const useAdaptivePanelWidths = () => {
  const { measurements, getContentBasedLayout } = useSmartPanelSizing();
  
  // Use smart defaults
  const getInitialLeftWidth = useCallback(() => {
    if (typeof window !== 'undefined') {
      return Math.max(measurements.minWidthForText, Math.min(PANEL_BREAKPOINTS.MAX, window.innerWidth * 0.2));
    }
    return measurements.recommendedWidth;
  }, [measurements]);

  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(() => getInitialLeftWidth());
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(PANEL_BREAKPOINTS.DEFAULT_RIGHT);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Update left panel width when measurements change
  useEffect(() => {
    const stored = localStorage.getItem(PANEL_WIDTH_STORAGE_KEY);
    if (stored) {
      try {
        const data: PanelWidthSettings = JSON.parse(stored);
        if (data.version === PANEL_WIDTH_VERSION) {
          const constrainedLeft = Math.max(measurements.minWidthForText, Math.min(PANEL_BREAKPOINTS.MAX, data.leftPanelWidth));
          const constrainedRight = Math.max(PANEL_BREAKPOINTS.MIN, Math.min(PANEL_BREAKPOINTS.MAX, data.rightPanelWidth));
          setLeftPanelWidth(constrainedLeft);
          setRightPanelWidth(constrainedRight);
          return;
        }
      } catch (error) {
        console.warn('Failed to load panel widths from storage:', error);
      }
    }
    
    // No stored settings, use smart default
    setLeftPanelWidth(getInitialLeftWidth());
  }, [measurements.minWidthForText, getInitialLeftWidth]);

  // Save panel widths to storage (debounced)
  const saveWidthsToStorage = useCallback((leftWidth: number, rightWidth: number) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      try {
        const data: PanelWidthSettings = {
          leftPanelWidth: leftWidth,
          rightPanelWidth: rightWidth,
          version: PANEL_WIDTH_VERSION,
          timestamp: Date.now()
        };
        localStorage.setItem(PANEL_WIDTH_STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.warn('Failed to save panel widths to storage:', error);
      }
    }, 300);
  }, []);

  // Convert pixel width to percentage for ResizablePanelGroup
  const getInitialPercentage = useCallback((pixelWidth: number, isVisible: boolean) => {
    if (!isVisible) return 0;
    // Use a fixed reference width for consistent percentage calculation
    const referenceWidth = 1400;
    return Math.max(15, Math.min(35, (pixelWidth / referenceWidth) * 100));
  }, []);

  // Convert percentage back to pixels (from ResizablePanelGroup onResize)
  const convertPercentageToPixels = useCallback((percentage: number) => {
    const referenceWidth = 1400;
    return Math.round((percentage / 100) * referenceWidth);
  }, []);

  const handleLeftPanelResize = useCallback((percentage: number) => {
    const pixelWidth = convertPercentageToPixels(percentage);
    const constrainedWidth = Math.max(measurements.minWidthForText, Math.min(PANEL_BREAKPOINTS.MAX, pixelWidth));
    setLeftPanelWidth(constrainedWidth);
    saveWidthsToStorage(constrainedWidth, rightPanelWidth);
  }, [rightPanelWidth, saveWidthsToStorage, convertPercentageToPixels, measurements.minWidthForText]);

  const handleRightPanelResize = useCallback((percentage: number) => {
    const pixelWidth = convertPercentageToPixels(percentage);
    const constrainedWidth = Math.max(PANEL_BREAKPOINTS.MIN, Math.min(PANEL_BREAKPOINTS.MAX, pixelWidth));
    setRightPanelWidth(constrainedWidth);
    saveWidthsToStorage(leftPanelWidth, constrainedWidth);
  }, [leftPanelWidth, saveWidthsToStorage, convertPercentageToPixels]);

  const getLeftPanelLayout = useCallback((): PanelLayout => {
    return getContentBasedLayout(leftPanelWidth);
  }, [leftPanelWidth, getContentBasedLayout]);

  const getRightPanelLayout = useCallback((): PanelLayout => {
    if (rightPanelWidth <= 180) return 'ultra-compact';
    if (rightPanelWidth <= 250) return 'compact';
    if (rightPanelWidth <= 350) return 'standard';
    return 'wide';
  }, [rightPanelWidth]);

  return {
    leftPanelWidth,
    rightPanelWidth,
    leftPanelLayout: getLeftPanelLayout(),
    rightPanelLayout: getRightPanelLayout(),
    handleLeftPanelResize,
    handleRightPanelResize,
    getInitialPercentage,
    measurements, // Expose measurements for debugging
  };
};
