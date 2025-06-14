
import { useState, useCallback, useRef, useEffect } from 'react';

export const PANEL_BREAKPOINTS = {
  ICON_ONLY: 56,
  ULTRA_COMPACT: 120,
  COMPACT: 200,
  STANDARD: 300,
  WIDE: 400,
  MAX: 500
} as const;

export type PanelLayout = 'icon-only' | 'ultra-compact' | 'compact' | 'standard' | 'wide';

interface PanelWidthSettings {
  leftPanelWidth: number;
  rightPanelWidth: number;
  version: string;
  timestamp: number;
}

const PANEL_WIDTH_STORAGE_KEY = 'langcanvas_panel_widths';
const PANEL_WIDTH_VERSION = '1.0';

const DEFAULT_WIDTHS = {
  leftPanelWidth: 256,
  rightPanelWidth: 320
};

export const useAdaptivePanelWidths = () => {
  const [leftPanelWidth, setLeftPanelWidth] = useState(DEFAULT_WIDTHS.leftPanelWidth);
  const [rightPanelWidth, setRightPanelWidth] = useState(DEFAULT_WIDTHS.rightPanelWidth);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load panel widths from storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PANEL_WIDTH_STORAGE_KEY);
      if (stored) {
        const data: PanelWidthSettings = JSON.parse(stored);
        if (data.version === PANEL_WIDTH_VERSION) {
          setLeftPanelWidth(Math.max(PANEL_BREAKPOINTS.ICON_ONLY, Math.min(PANEL_BREAKPOINTS.MAX, data.leftPanelWidth)));
          setRightPanelWidth(Math.max(PANEL_BREAKPOINTS.ICON_ONLY, Math.min(PANEL_BREAKPOINTS.MAX, data.rightPanelWidth)));
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

  const handleLeftPanelResize = useCallback((width: number) => {
    const constrainedWidth = Math.max(PANEL_BREAKPOINTS.ICON_ONLY, Math.min(PANEL_BREAKPOINTS.MAX, width));
    setLeftPanelWidth(constrainedWidth);
    saveWidthsToStorage(constrainedWidth, rightPanelWidth);
  }, [rightPanelWidth, saveWidthsToStorage]);

  const handleRightPanelResize = useCallback((width: number) => {
    const constrainedWidth = Math.max(PANEL_BREAKPOINTS.ICON_ONLY, Math.min(PANEL_BREAKPOINTS.MAX, width));
    setRightPanelWidth(constrainedWidth);
    saveWidthsToStorage(leftPanelWidth, constrainedWidth);
  }, [leftPanelWidth, saveWidthsToStorage]);

  const getLeftPanelLayout = useCallback((): PanelLayout => {
    if (leftPanelWidth <= PANEL_BREAKPOINTS.ICON_ONLY) return 'icon-only';
    if (leftPanelWidth <= PANEL_BREAKPOINTS.ULTRA_COMPACT) return 'ultra-compact';
    if (leftPanelWidth <= PANEL_BREAKPOINTS.COMPACT) return 'compact';
    if (leftPanelWidth <= PANEL_BREAKPOINTS.STANDARD) return 'standard';
    return 'wide';
  }, [leftPanelWidth]);

  const getRightPanelLayout = useCallback((): PanelLayout => {
    if (rightPanelWidth <= PANEL_BREAKPOINTS.ICON_ONLY) return 'icon-only';
    if (rightPanelWidth <= PANEL_BREAKPOINTS.ULTRA_COMPACT) return 'ultra-compact';
    if (rightPanelWidth <= PANEL_BREAKPOINTS.COMPACT) return 'compact';
    if (rightPanelWidth <= PANEL_BREAKPOINTS.STANDARD) return 'standard';
    return 'wide';
  }, [rightPanelWidth]);

  return {
    leftPanelWidth,
    rightPanelWidth,
    leftPanelLayout: getLeftPanelLayout(),
    rightPanelLayout: getRightPanelLayout(),
    handleLeftPanelResize,
    handleRightPanelResize
  };
};
