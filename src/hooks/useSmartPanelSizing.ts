
import { useState, useEffect, useCallback, useRef } from 'react';
import { nodeCategories } from '../utils/nodeCategories';

interface ContentMeasurements {
  minWidthForIcons: number;
  minWidthForText: number;
  recommendedWidth: number;
}

export const useSmartPanelSizing = () => {
  const [measurements, setMeasurements] = useState<ContentMeasurements>({
    minWidthForIcons: 60, // Minimum for small layout (icon + text)
    minWidthForText: 70, // Threshold to switch to medium layout
    recommendedWidth: 85 // Default recommended width
  });
  const measurementRef = useRef<HTMLDivElement>();

  const measureContent = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Fixed measurements based on requirements
    const minWidthForIcons = 60; // Small layout minimum (icon + text)
    const minWidthForText = 70; // Switch threshold to medium layout
    const windowWidth = window.innerWidth;
    const recommendedWidth = Math.max(70, Math.min(100, windowWidth * 0.15));

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
    // Simple threshold: switch to medium when width reaches 70px
    return width >= 70 ? 'medium' : 'small';
  }, []);

  return {
    measurements,
    getContentBasedLayout,
    measureContent
  };
};
