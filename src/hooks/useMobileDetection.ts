
import { useState, useEffect } from 'react';

export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const windowWidth = window.innerWidth;
      const hasTouchStart = 'ontouchstart' in window;
      const newIsMobile = windowWidth < 768 || hasTouchStart;
      
      console.log('📱 Mobile Detection Check:', {
        windowWidth,
        hasTouchStart,
        threshold: 768,
        previousIsMobile: isMobile,
        newIsMobile,
        changed: isMobile !== newIsMobile
      });
      
      setIsMobile(newIsMobile);
    };
    
    console.log('📱 Mobile Detection - Setting up listeners');
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => {
      console.log('📱 Mobile Detection - Cleaning up listeners');
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  console.log('📱 Mobile Detection - Current state:', isMobile);
  return isMobile;
};
