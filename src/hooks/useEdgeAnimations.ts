
import { useEffect, useRef, useState, useCallback } from 'react';
import { EnhancedEdge } from '../types/edgeTypes';
import { useAnimationState } from './useAnimationState';
import { useDataFlowParticles } from './useDataFlowParticles';
import { useAnimationLoop } from './useAnimationLoop';
import { useAnimationControls } from './useAnimationControls';

export type { EdgeAnimationConfig, EdgeAnimation } from './useAnimationState';
export type { DataFlowParticle } from './useDataFlowParticles';

export const useEdgeAnimations = (
  edges: EnhancedEdge[],
  animationsEnabled: boolean = true
) => {
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const previousEdgesRef = useRef<EnhancedEdge[]>([]);

  const {
    activeAnimations,
    setActiveAnimations,
    animationFrameRef,
    defaultConfig
  } = useAnimationState();

  const {
    dataFlowParticles,
    setDataFlowParticles,
    startDataFlow,
    stopDataFlow,
    getDataFlowParticles
  } = useDataFlowParticles(animationsEnabled);

  const {
    createAnimation,
    removeAnimation,
    animateEdgeCreation,
    animateEdgeDeletion,
    animateEdgeUpdate
  } = useAnimationControls(animationsEnabled, setActiveAnimations, defaultConfig);

  useAnimationLoop(
    animationsEnabled,
    activeAnimations,
    setActiveAnimations,
    animationFrameRef,
    dataFlowParticles,
    setDataFlowParticles
  );

  const setEdgeHover = useCallback((edgeId: string | null) => {
    setHoveredEdgeId(edgeId);
    if (edgeId && animationsEnabled) {
      createAnimation(edgeId, 'hover', { duration: 150, easing: 'ease-out' });
    }
  }, [createAnimation, animationsEnabled]);

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

  const getAnimationProgress = useCallback((edgeId: string, type?: 'create' | 'delete' | 'update' | 'flow' | 'hover'): number => {
    for (const animation of activeAnimations.values()) {
      if (animation.edgeId === edgeId && (!type || animation.type === type)) {
        return animation.progress;
      }
    }
    return 1;
  }, [activeAnimations]);

  const isAnimating = useCallback((edgeId: string, type?: 'create' | 'delete' | 'update' | 'flow' | 'hover'): boolean => {
    for (const animation of activeAnimations.values()) {
      if (animation.edgeId === edgeId && (!type || animation.type === type) && !animation.completed) {
        return true;
      }
    }
    return false;
  }, [activeAnimations]);

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
