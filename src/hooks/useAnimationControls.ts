
import { useCallback } from 'react';
import { EdgeAnimation, EdgeAnimationConfig } from './useAnimationState';

export const useAnimationControls = (
  animationsEnabled: boolean,
  setActiveAnimations: (value: Map<string, EdgeAnimation> | ((prev: Map<string, EdgeAnimation>) => Map<string, EdgeAnimation>)) => void,
  defaultConfig: EdgeAnimationConfig
) => {
  const createAnimation = useCallback((
    edgeId: string,
    type: EdgeAnimation['type'],
    config: Partial<EdgeAnimationConfig> = {}
  ): string => {
    const id = `${edgeId}-${type}-${Date.now()}`;
    const animation: EdgeAnimation = {
      id,
      edgeId,
      type,
      startTime: performance.now(),
      config: { ...defaultConfig, ...config },
      progress: 0,
      completed: false
    };

    setActiveAnimations(prev => new Map(prev).set(id, animation));
    return id;
  }, [setActiveAnimations, defaultConfig]);

  const removeAnimation = useCallback((animationId: string) => {
    setActiveAnimations(prev => {
      const next = new Map(prev);
      next.delete(animationId);
      return next;
    });
  }, [setActiveAnimations]);

  const animateEdgeCreation = useCallback((edgeId: string) => {
    if (!animationsEnabled) return;
    return createAnimation(edgeId, 'create', { duration: 400, easing: 'ease-out' });
  }, [createAnimation, animationsEnabled]);

  const animateEdgeDeletion = useCallback((edgeId: string) => {
    if (!animationsEnabled) return;
    return createAnimation(edgeId, 'delete', { duration: 300, easing: 'ease-in' });
  }, [createAnimation, animationsEnabled]);

  const animateEdgeUpdate = useCallback((edgeId: string) => {
    if (!animationsEnabled) return;
    return createAnimation(edgeId, 'update', { duration: 200, easing: 'ease-out' });
  }, [createAnimation, animationsEnabled]);

  return {
    createAnimation,
    removeAnimation,
    animateEdgeCreation,
    animateEdgeDeletion,
    animateEdgeUpdate
  };
};
