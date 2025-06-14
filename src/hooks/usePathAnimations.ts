
import { useEffect, useRef, useState } from 'react';
import { EnhancedEdge } from '../types/edgeTypes';

interface PathAnimation {
  edgeId: string;
  progress: number;
  startTime: number;
  duration: number;
}

export const usePathAnimations = (
  edges: EnhancedEdge[],
  animationEnabled: boolean = true,
  animationDuration: number = 300
) => {
  const [activeAnimations, setActiveAnimations] = useState<Map<string, PathAnimation>>(new Map());
  const previousEdgesRef = useRef<EnhancedEdge[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!animationEnabled) {
      previousEdgesRef.current = edges;
      return;
    }

    const previousEdges = previousEdgesRef.current;
    const newAnimations = new Map<string, PathAnimation>();

    // Detect edge changes that need animation
    edges.forEach(edge => {
      const previousEdge = previousEdges.find(prev => prev.id === edge.id);
      
      if (previousEdge && hasPathChanged(previousEdge, edge)) {
        newAnimations.set(edge.id, {
          edgeId: edge.id,
          progress: 0,
          startTime: performance.now(),
          duration: animationDuration
        });
      }
    });

    if (newAnimations.size > 0) {
      setActiveAnimations(newAnimations);
      startAnimationLoop();
    }

    previousEdgesRef.current = edges;
  }, [edges, animationEnabled, animationDuration]);

  const hasPathChanged = (oldEdge: EnhancedEdge, newEdge: EnhancedEdge): boolean => {
    const oldWaypoints = oldEdge.waypoints || [];
    const newWaypoints = newEdge.waypoints || [];
    
    if (oldWaypoints.length !== newWaypoints.length) return true;
    
    return oldWaypoints.some((point, index) => {
      const newPoint = newWaypoints[index];
      return !newPoint || point.x !== newPoint.x || point.y !== newPoint.y;
    });
  };

  const startAnimationLoop = () => {
    const animate = () => {
      const now = performance.now();
      
      setActiveAnimations(prev => {
        const updated = new Map(prev);
        let hasActiveAnimations = false;

        updated.forEach((animation, edgeId) => {
          const elapsed = now - animation.startTime;
          const progress = Math.min(elapsed / animation.duration, 1);
          
          if (progress >= 1) {
            updated.delete(edgeId);
          } else {
            updated.set(edgeId, {
              ...animation,
              progress: easeOutCubic(progress)
            });
            hasActiveAnimations = true;
          }
        });

        if (hasActiveAnimations) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }

        return updated;
      });
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const easeOutCubic = (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const getAnimationProgress = (edgeId: string): number => {
    const animation = activeAnimations.get(edgeId);
    return animation ? animation.progress : 1;
  };

  const isAnimating = (edgeId: string): boolean => {
    return activeAnimations.has(edgeId);
  };

  return {
    activeAnimations,
    getAnimationProgress,
    isAnimating,
    hasActiveAnimations: activeAnimations.size > 0
  };
};
