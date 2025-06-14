
import { useState, useRef } from 'react';

export interface EdgeAnimationConfig {
  duration: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'cubic-bezier';
  delay?: number;
}

export interface EdgeAnimation {
  id: string;
  edgeId: string;
  type: 'create' | 'delete' | 'update' | 'flow' | 'hover';
  startTime: number;
  config: EdgeAnimationConfig;
  progress: number;
  completed: boolean;
}

export const useAnimationState = () => {
  const [activeAnimations, setActiveAnimations] = useState<Map<string, EdgeAnimation>>(new Map());
  const animationFrameRef = useRef<number>();

  const defaultConfig: EdgeAnimationConfig = {
    duration: 300,
    easing: 'ease-out',
    delay: 0
  };

  return {
    activeAnimations,
    setActiveAnimations,
    animationFrameRef,
    defaultConfig
  };
};
