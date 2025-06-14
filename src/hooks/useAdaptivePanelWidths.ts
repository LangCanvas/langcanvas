
import { useState, useCallback, useRef, useEffect } from 'react';

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
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(PANEL_BREAKPOINTS.DEFAULT_LEFT);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(PANEL_BREAKPOINTS.DEFAULT_RIGHT);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load panel widths from storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PANEL_WIDTH_STORAGE_KEY);
      if (stored) {
        const data: PanelWidthSettings = JSON.parse(stored);
        if (data.version === PANEL_WIDTH_VERSION) {
          setLeftPanelWidth(Math.max(PANEL_BREAKPOINTS.MIN, Math.min(PANEL_BREAKPOINTS.MAX, data.leftPanelWidth)));
          setRightPanelWidth(Math.max(PANEL_BREAKPOINTS.MIN, Math.min(PANEL_BREAKPOINTS.MAX, data.rightPanelWidth)));
        }
      }
    } catch (error) {
      console.warn('Failed to load panel widths from storage:', error);
    }
  }, []);

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
    const constrainedWidth = Math.max(PANEL_BREAKPOINTS.MIN, Math.min(PANEL_BREAKPOINTS.MAX, pixelWidth));
    setLeftPanelWidth(constrainedWidth);
    saveWidthsToStorage(constrainedWidth, rightPanelWidth);
  }, [rightPanelWidth, saveWidthsToStorage, convertPercentageToPixels]);

  const handleRightPanelResize = useCallback((percentage: number) => {
    const pixelWidth = convertPercentageToPixels(percentage);
    const constrainedWidth = Math.max(PANEL_BREAKPOINTS.MIN, Math.min(PANEL_BREAKPOINTS.MAX, pixelWidth));
    setRightPanelWidth(constrainedWidth);
    saveWidthsToStorage(leftPanelWidth, constrainedWidth);
  }, [leftPanelWidth, saveWidthsToStorage, convertPercentageToPixels]);

  const getLeftPanelLayout = useCallback((): PanelLayout => {
    if (leftPanelWidth <= 180) return 'ultra-compact';
    if (leftPanelWidth <= 250) return 'compact';
    if (leftPanelWidth <= 350) return 'standard';
    return 'wide';
  }, [leftPanelWidth]);

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
  };
};
