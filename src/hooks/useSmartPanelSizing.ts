
import { useState, useEffect, useCallback, useRef } from 'react';
import { nodeCategories } from '../utils/nodeCategories';

interface ContentMeasurements {
  minWidthForIcons: number;
  minWidthForText: number;
  minWidthForDescriptions: number;
  recommendedWidth: number;
}

export const useSmartPanelSizing = () => {
  const [measurements, setMeasurements] = useState<ContentMeasurements>({
    minWidthForIcons: 56, // Very small for icon-only mode
    minWidthForText: 130,
    minWidthForDescriptions: 210,
    recommendedWidth: 280
  });
  const measurementRef = useRef<HTMLDivElement>();

  const measureContent = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Create a temporary measurement element
    const measureEl = document.createElement('div');
    measureEl.style.position = 'absolute';
    measureEl.style.visibility = 'hidden';
    measureEl.style.whiteSpace = 'nowrap';
    measureEl.style.fontSize = '12px'; // text-xs
    measureEl.style.fontWeight = '400';
    document.body.appendChild(measureEl);

    // Find the longest category name
    const categoryNames = ['All Nodes', ...nodeCategories.map(cat => cat.label)];
    let maxTextWidth = 0;

    categoryNames.forEach(name => {
      measureEl.textContent = name;
      const width = measureEl.getBoundingClientRect().width;
      maxTextWidth = Math.max(maxTextWidth, width);
    });

    document.body.removeChild(measureEl);

    // Calculate minimum widths with reduced constraints for ultra-compact
    const iconWidth = 16; // icon size
    const buttonSpacing = 8; // mr-2 spacing
    const buttonPadding = 12; // reduced for compact mode
    const panelPadding = 16; // reduced from 32
    const margins = 4; // reduced margins
    
    // Icon-only mode: just icon + minimal padding
    const minWidthForIcons = iconWidth + buttonPadding + panelPadding;
    
    // Text mode: icon + text + padding
    const minWidthForText = Math.ceil(maxTextWidth + iconWidth + buttonSpacing + buttonPadding + panelPadding + margins);
    
    // Description mode: extra space for descriptions
    const minWidthForDescriptions = minWidthForText + 80;
    
    // Calculate 20% of window width as recommended
    const windowWidth = window.innerWidth;
    const recommendedWidth = Math.max(minWidthForText, Math.min(400, windowWidth * 0.2));

    setMeasurements({
      minWidthForIcons,
      minWidthForText,
      minWidthForDescriptions,
      recommendedWidth
    });
  }, []);

  // Measure on mount and window resize
  useEffect(() => {
    measureContent();
    
    const handleResize = () => {
      setTimeout(measureContent, 100); // Debounce resize
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [measureContent]);

  const getContentBasedLayout = useCallback((width: number) => {
    if (width < measurements.minWidthForIcons + 20) return 'icon-only';
    if (width < measurements.minWidthForText) return 'ultra-compact';
    if (width < measurements.minWidthForDescriptions) return 'compact';
    if (width < 350) return 'standard';
    return 'wide';
  }, [measurements]);

  return {
    measurements,
    getContentBasedLayout,
    measureContent
  };
};
