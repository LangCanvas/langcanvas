
import { useEffect, useRef, useState, useCallback } from 'react';
import { EnhancedEdge } from '../types/edgeTypes';

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

export interface DataFlowParticle {
  id: string;
  edgeId: string;
  position: number; // 0 to 1 along the path
  speed: number;
  active: boolean;
}

export const useEdgeAnimations = (
  edges: EnhancedEdge[],
  animationsEnabled: boolean = true
) => {
  const [activeAnimations, setActiveAnimations] = useState<Map<string, EdgeAnimation>>(new Map());
  const [dataFlowParticles, setDataFlowParticles] = useState<Map<string, DataFlowParticle[]>>(new Map());
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  
  const animationFrameRef = useRef<number>();
  const previousEdgesRef = useRef<EnhancedEdge[]>([]);

  const defaultConfig: EdgeAnimationConfig = {
    duration: 300,
    easing: 'ease-out',
    delay: 0
  };

  const easing = {
    linear: (t: number) => t,
    'ease-in': (t: number) => t * t,
    'ease-out': (t: number) => 1 - (1 - t) * (1 - t),
    'ease-in-out': (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    'cubic-bezier': (t: number) => t * t * (3 - 2 * t)
  };

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
  }, []);

  const removeAnimation = useCallback((animationId: string) => {
    setActiveAnimations(prev => {
      const next = new Map(prev);
      next.delete(animationId);
      return next;
    });
  }, []);

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

  const startDataFlow = useCallback((edgeId: string, particleCount: number = 3) => {
    if (!animationsEnabled) return;
    
    const particles: DataFlowParticle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: `${edgeId}-particle-${i}`,
      edgeId,
      position: i * (1 / particleCount),
      speed: 0.5 + Math.random() * 0.5, // Vary speed slightly
      active: true
    }));

    setDataFlowParticles(prev => new Map(prev).set(edgeId, particles));
  }, [animationsEnabled]);

  const stopDataFlow = useCallback((edgeId: string) => {
    setDataFlowParticles(prev => {
      const next = new Map(prev);
      next.delete(edgeId);
      return next;
    });
  }, []);

  const setEdgeHover = useCallback((edgeId: string | null) => {
    setHoveredEdgeId(edgeId);
    if (edgeId && animationsEnabled) {
      createAnimation(edgeId, 'hover', { duration: 150, easing: 'ease-out' });
    }
  }, [createAnimation, animationsEnabled]);

  // Animation loop
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

  // Detect edge changes for automatic animations
  useEffect(() => {
    if (!animationsEnabled) {
      previousEdgesRef.current = edges;
      return;
    }

    const previousEdges = previousEdgesRef.current;
    const currentEdgeIds = new Set(edges.map(e => e.id));
    const previousEdgeIds = new Set(previousEdges.map(e => e.id));

    // Animate new edges
    edges.forEach(edge => {
      if (!previousEdgeIds.has(edge.id)) {
        animateEdgeCreation(edge.id);
      }
    });

    // Animate updated edges
    edges.forEach(edge => {
      const previousEdge = previousEdges.find(e => e.id === edge.id);
      if (previousEdge && hasEdgeChanged(previousEdge, edge)) {
        animateEdgeUpdate(edge.id);
      }
    });

    previousEdgesRef.current = edges;
  }, [edges, animationsEnabled, animateEdgeCreation, animateEdgeUpdate]);

  const hasEdgeChanged = (oldEdge: EnhancedEdge, newEdge: EnhancedEdge): boolean => {
    return oldEdge.source !== newEdge.source || 
           oldEdge.target !== newEdge.target ||
           JSON.stringify(oldEdge.waypoints) !== JSON.stringify(newEdge.waypoints);
  };

  const getAnimationProgress = useCallback((edgeId: string, type?: EdgeAnimation['type']): number => {
    for (const animation of activeAnimations.values()) {
      if (animation.edgeId === edgeId && (!type || animation.type === type)) {
        return animation.progress;
      }
    }
    return 1;
  }, [activeAnimations]);

  const isAnimating = useCallback((edgeId: string, type?: EdgeAnimation['type']): boolean => {
    for (const animation of activeAnimations.values()) {
      if (animation.edgeId === edgeId && (!type || animation.type === type) && !animation.completed) {
        return true;
      }
    }
    return false;
  }, [activeAnimations]);

  const getDataFlowParticles = useCallback((edgeId: string): DataFlowParticle[] => {
    return dataFlowParticles.get(edgeId) || [];
  }, [dataFlowParticles]);

  return {
    // Animation controls
    animateEdgeCreation,
    animateEdgeDeletion,
    animateEdgeUpdate,
    createAnimation,
    removeAnimation,
    
    // Data flow controls
    startDataFlow,
    stopDataFlow,
    getDataFlowParticles,
    
    // Hover effects
    setEdgeHover,
    hoveredEdgeId,
    
    // Animation state
    activeAnimations,
    getAnimationProgress,
    isAnimating,
    
    // Performance info
    animationCount: activeAnimations.size,
    particleCount: Array.from(dataFlowParticles.values()).reduce((acc, particles) => acc + particles.length, 0)
  };
};
