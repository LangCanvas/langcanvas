
import { useState, useEffect, useCallback, useRef } from 'react';
import { nodeCategories } from '../utils/nodeCategories';

interface ContentMeasurements {
  minWidthForText: number;
  minWidthForDescriptions: number;
  recommendedWidth: number;
}

export const useSmartPanelSizing = () => {
  const [measurements, setMeasurements] = useState<ContentMeasurements>({
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

    // Calculate minimum widths
    const iconWidth = 16; // mr-2 spacing + icon
    const buttonPadding = 16; // px-2 = 8px each side
    const panelPadding = 32; // p-4 = 16px each side
    const margins = 8; // various margins
    
    const minWidthForText = Math.ceil(maxTextWidth + iconWidth + buttonPadding + panelPadding + margins);
    const minWidthForDescriptions = minWidthForText + 80; // extra space for descriptions
    
    // Calculate 20% of window width as recommended
    const windowWidth = window.innerWidth;
    const recommendedWidth = Math.max(minWidthForText, Math.min(400, windowWidth * 0.2));

    setMeasurements({
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
