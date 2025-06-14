
import { useEffect } from 'react';
import { EdgeAnimation } from './useAnimationState';

const easing = {
  linear: (t: number) => t,
  'ease-in': (t: number) => t * t,
  'ease-out': (t: number) => 1 - (1 - t) * (1 - t),
  'ease-in-out': (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  'cubic-bezier': (t: number) => t * t * (3 - 2 * t)
};

export const useAnimationLoop = (
  animationsEnabled: boolean,
  activeAnimations: Map<string, EdgeAnimation>,
  setActiveAnimations: (value: Map<string, EdgeAnimation> | ((prev: Map<string, EdgeAnimation>) => Map<string, EdgeAnimation>)) => void,
  animationFrameRef: React.MutableRefObject<number | undefined>,
  dataFlowParticles: Map<string, any[]>,
  setDataFlowParticles: (value: Map<string, any[]> | ((prev: Map<string, any[]>) => Map<string, any[]>)) => void
) => {
  useEffect(() => {
    if (!animationsEnabled) return;

    const animate = () => {
      const now = performance.now();

      setActiveAnimations(prev => {
        const updated = new Map();
        let hasActiveAnimations = false;

        prev.forEach((animation, id) => {
          const elapsed = now - animation.startTime - (animation.config.delay || 0);
          
          if (elapsed < 0) {
            updated.set(id, animation);
            hasActiveAnimations = true;
            return;
          }

          const rawProgress = Math.min(elapsed / animation.config.duration, 1);
          const easedProgress = easing[animation.config.easing](rawProgress);

          if (rawProgress >= 1) {
            updated.set(id, { ...animation, progress: 1, completed: true });
          } else {
            updated.set(id, { ...animation, progress: easedProgress });
            hasActiveAnimations = true;
          }
        });

        return updated;
      });

      // Update data flow particles
      setDataFlowParticles(prev => {
        const updated = new Map();
        
        prev.forEach((particles, edgeId) => {
          const updatedParticles = particles.map(particle => ({
            ...particle,
            position: (particle.position + particle.speed * 0.016) % 1 // 60fps assumption
          }));
          updated.set(edgeId, updatedParticles);
        });

        return updated;
      });

      if (activeAnimations.size > 0 || dataFlowParticles.size > 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animationsEnabled, activeAnimations.size, dataFlowParticles.size]);
};
