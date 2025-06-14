
import { useState, useEffect, useCallback, useRef } from 'react';
import { nodeCategories } from '../utils/nodeCategories';

interface ContentMeasurements {
  minWidthForIcons: number;
  minWidthForText: number;
  recommendedWidth: number;
}

export const useSmartPanelSizing = () => {
  const [measurements, setMeasurements] = useState<ContentMeasurements>({
    minWidthForIcons: 60, // Updated minimum for small layout (reduced from 80px to 60px)
    minWidthForText: 90, // Threshold to switch to medium layout
    recommendedWidth: 95 // Default recommended width
  });
  const measurementRef = useRef<HTMLDivElement>();

  const measureContent = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Fixed measurements based on updated requirements
    const minWidthForIcons = 60; // Small layout minimum (reduced to 60px)
    const minWidthForText = 90; // Switch threshold to medium layout
    const windowWidth = window.innerWidth;
    const recommendedWidth = Math.max(60, Math.min(100, windowWidth * 0.15));

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
    // Simple threshold: switch to medium when width reaches 90px
    return width >= 90 ? 'medium' : 'small';
  }, []);

  return {
    measurements,
    getContentBasedLayout,
    measureContent
  };
};
