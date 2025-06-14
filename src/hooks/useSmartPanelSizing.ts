
import { useState, useEffect, useCallback, useRef } from 'react';
import { nodeCategories } from '../utils/nodeCategories';

interface ContentMeasurements {
  minWidthForIcons: number;
  minWidthForText: number;
  recommendedWidth: number;
}

export const useSmartPanelSizing = () => {
  const [measurements, setMeasurements] = useState<ContentMeasurements>({
    minWidthForIcons: 50, // Updated minimum for small layout (reduced from 60px to 50px)
    minWidthForText: 70, // Threshold to switch to medium layout (reduced from 90px to 70px)
    recommendedWidth: 95 // Default recommended width
  });
  const measurementRef = useRef<HTMLDivElement>();

  const measureContent = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Fixed measurements based on updated requirements
    const minWidthForIcons = 50; // Small layout minimum (reduced to 50px)
    const minWidthForText = 70; // Switch threshold to medium layout (reduced from 90px to 70px)
    const windowWidth = window.innerWidth;
    const recommendedWidth = Math.max(50, Math.min(100, windowWidth * 0.15));

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
    // Simple threshold: switch to medium when width reaches 70px (reduced from 90px)
    return width >= 70 ? 'medium' : 'small';
  }, []);

  return {
    measurements,
    getContentBasedLayout,
    measureContent
  };
};
