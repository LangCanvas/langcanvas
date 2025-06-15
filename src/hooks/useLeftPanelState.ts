import { useState, useCallback, useEffect } from 'react';
import { PanelLayout } from '../types/panelTypes';

// Left panel specific breakpoints - adjusted for better layout switching
export const LEFT_PANEL_BREAKPOINTS = {
  MIN: 50, // Minimum width for small layout
  SWITCH_THRESHOLD: 60, // Lowered from 70px for more reliable switching
  MAX: 100, // Reduced from 120px to 100px
  DEFAULT: 70 // Reduced from 95px to 70px
} as const;

export type LeftPanelLayout = PanelLayout;

export const useLeftPanelState = () => {
  const [viewportWidth, setViewportWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return 1400; // fallback
  });

  const getInitialLeftWidth = useCallback(() => {
    // Always use DEFAULT constant to ensure consistent medium layout on load
    return LEFT_PANEL_BREAKPOINTS.DEFAULT;
  }, []);

  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(() => getInitialLeftWidth());

  // Add viewport resize listener for real-time updates
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setViewportWidth(newWidth);
      console.log('🎛️ useLeftPanelState - Viewport resized:', { newWidth, oldWidth: viewportWidth });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewportWidth]);

  const convertPercentageToPixels = useCallback((percentage: number) => {
    // Use actual viewport width instead of fixed 1400px
    const actualWidth = viewportWidth;
    const pixelWidth = Math.round((percentage / 100) * actualWidth);
    console.log('🎛️ useLeftPanelState - Percentage to pixels conversion:', {
      percentage,
      viewportWidth: actualWidth,
      pixelWidth,
      isActualViewport: true
    });
    return pixelWidth;
  }, [viewportWidth]);

  // Calculate the maximum percentage that represents our MAX breakpoint
  const getMaxPercentageForLeftPanel = useCallback(() => {
    const maxPercentage = (LEFT_PANEL_BREAKPOINTS.MAX / viewportWidth) * 100;
    console.log('🎛️ useLeftPanelState - Max percentage calculation:', {
      maxPixels: LEFT_PANEL_BREAKPOINTS.MAX,
      viewportWidth,
      maxPercentage
    });
    return maxPercentage;
  }, [viewportWidth]);

  // Calculate the minimum percentage that represents our MIN breakpoint
  const getMinPercentageForLeftPanel = useCallback(() => {
    const minPercentage = (LEFT_PANEL_BREAKPOINTS.MIN / viewportWidth) * 100;
    console.log('🎛️ useLeftPanelState - Min percentage calculation:', {
      minPixels: LEFT_PANEL_BREAKPOINTS.MIN,
      viewportWidth,
      minPercentage
    });
    return minPercentage;
  }, [viewportWidth]);

  const handleLeftPanelResize = useCallback((percentage: number) => {
    console.log('🎛️ useLeftPanelState - Resize triggered:', { 
      percentage, 
      viewportWidth,
      currentWidth: leftPanelWidth 
    });
    
    // Convert percentage to actual pixel width using real viewport
    const pixelWidth = convertPercentageToPixels(percentage);
    
    // Apply breakpoint constraints
    const constrainedWidth = Math.max(
      LEFT_PANEL_BREAKPOINTS.MIN, 
      Math.min(LEFT_PANEL_BREAKPOINTS.MAX, pixelWidth)
    );
    
    console.log('🎛️ useLeftPanelState - Width calculation details:', {
      inputPercentage: percentage,
      viewportWidth,
      calculatedPixelWidth: pixelWidth,
      constrainedWidth,
      oldWidth: leftPanelWidth,
      willTriggerLayoutChange: constrainedWidth < LEFT_PANEL_BREAKPOINTS.SWITCH_THRESHOLD !== leftPanelWidth < LEFT_PANEL_BREAKPOINTS.SWITCH_THRESHOLD
    });
    
    setLeftPanelWidth(constrainedWidth);
  }, [convertPercentageToPixels, leftPanelWidth, viewportWidth]);

  // INDEPENDENT layout calculation with enhanced logging
  const getLeftPanelLayout = useCallback((): LeftPanelLayout => {
    const layout = leftPanelWidth >= LEFT_PANEL_BREAKPOINTS.SWITCH_THRESHOLD ? 'medium' : 'small';
    console.log('🎛️ useLeftPanelState - Layout calculation:', {
      leftPanelWidth,
      switchThreshold: LEFT_PANEL_BREAKPOINTS.SWITCH_THRESHOLD,
      layout,
      isSmall: layout === 'small',
      isMedium: layout === 'medium',
      viewportWidth,
      breakpointRatio: leftPanelWidth / LEFT_PANEL_BREAKPOINTS.SWITCH_THRESHOLD
    });
    return layout;
  }, [leftPanelWidth, viewportWidth]);

  const layout = getLeftPanelLayout();

  console.log('🎛️ useLeftPanelState - Current state summary:', {
    leftPanelWidth,
    layout,
    viewportWidth,
    breakpoints: LEFT_PANEL_BREAKPOINTS,
    percentageEquivalent: (leftPanelWidth / viewportWidth) * 100
  });

  return {
    leftPanelWidth,
    leftPanelLayout: layout,
    handleLeftPanelResize,
    getMaxPercentageForLeftPanel,
    getMinPercentageForLeftPanel,
  };
};
