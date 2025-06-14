
import { useState, useEffect, useCallback, useRef } from 'react';
import { nodeCategories } from '../utils/nodeCategories';

interface ContentMeasurements {
  minWidthForIcons: number;
  minWidthForText: number;
  recommendedWidth: number;
}

export const useSmartPanelSizing = () => {
  const [measurements, setMeasurements] = useState<ContentMeasurements>({
    minWidthForIcons: 32, // True minimum for icons only
    minWidthForText: 120,
    recommendedWidth: 140
  });
  const measurementRef = useRef<HTMLDivElement>();

  const measureContent = useCallback(() => {
    if (typeof window === 'undefined') return;

    const measureEl = document.createElement('div');
    measureEl.style.position = 'absolute';
    measureEl.style.visibility = 'hidden';
    measureEl.style.whiteSpace = 'nowrap';
    measureEl.style.fontSize = '12px';
    measureEl.style.fontWeight = '400';
    document.body.appendChild(measureEl);

    const categoryNames = ['All Nodes', ...nodeCategories.map(cat => cat.label)];
    let maxTextWidth = 0;

    categoryNames.forEach(name => {
      measureEl.textContent = name;
      const width = measureEl.getBoundingClientRect().width;
      maxTextWidth = Math.max(maxTextWidth, width);
    });

    document.body.removeChild(measureEl);

    const iconWidth = 16;
    const buttonSpacing = 8;
    const buttonPadding = 8;
    const panelPadding = 8;
    
    // Small (icon-only): just icon + minimal padding
    const minWidthForIcons = iconWidth + buttonPadding + panelPadding;
    
    // Medium (with text): icon + text + spacing + padding
    const minWidthForText = Math.ceil(maxTextWidth + iconWidth + buttonSpacing + buttonPadding + panelPadding + 4);
    
    const windowWidth = window.innerWidth;
    const recommendedWidth = Math.max(minWidthForText, Math.min(200, windowWidth * 0.15));

    setMeasurements({
      minWidthForIcons,
      minWidthForText,
      recommendedWidth
    });
  }, []);

  useEffect(() => {
    measureContent();
    
    const handleResize = () => {
      setTimeout(measureContent, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [measureContent]);

  const getContentBasedLayout = useCallback((width: number): 'small' | 'medium' => {
    return width < measurements.minWidthForText ? 'small' : 'medium';
  }, [measurements]);

  return {
    measurements,
    getContentBasedLayout,
    measureContent
  };
};
