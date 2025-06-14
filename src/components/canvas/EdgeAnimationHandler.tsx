
import React, { useEffect, useRef } from 'react';
import { EnhancedEdge } from '../../types/edgeTypes';
import { EnhancedNode } from '../../types/nodeTypes';

interface EdgeAnimationHandlerProps {
  edges: EnhancedEdge[];
  nodes: EnhancedNode[];
  children: React.ReactNode;
  animatePathChanges?: boolean;
}

interface AnimationState {
  edgeId: string;
  oldPath: string;
  newPath: string;
  startTime: number;
  duration: number;
}

const EdgeAnimationHandler: React.FC<EdgeAnimationHandlerProps> = ({
  edges,
  nodes,
  children,
  animatePathChanges = true
}) => {
  const previousEdgesRef = useRef<EnhancedEdge[]>([]);
  const animationsRef = useRef<Map<string, AnimationState>>(new Map());
  const frameRef = useRef<number>();

  useEffect(() => {
    if (!animatePathChanges) {
      previousEdgesRef.current = edges;
      return;
    }

    const previousEdges = previousEdgesRef.current;
    const newAnimations = new Map<string, AnimationState>();

    // Check for changed edges
    edges.forEach(edge => {
      const previousEdge = previousEdges.find(prev => prev.id === edge.id);
      if (previousEdge && previousEdge.waypoints && edge.waypoints) {
        const oldPath = previousEdge.waypoints.map(p => `${p.x},${p.y}`).join(' ');
        const newPath = edge.waypoints.map(p => `${p.x},${p.y}`).join(' ');
        
        if (oldPath !== newPath) {
          newAnimations.set(edge.id, {
            edgeId: edge.id,
            oldPath,
            newPath,
            startTime: performance.now(),
            duration: 300 // 300ms animation
          });
        }
      }
    });

    animationsRef.current = newAnimations;
    previousEdgesRef.current = edges;

    // Start animation loop if we have animations
    if (newAnimations.size > 0) {
      const animate = () => {
        const now = performance.now();
        const activeAnimations = new Map<string, AnimationState>();

        animationsRef.current.forEach((animation, edgeId) => {
          const elapsed = now - animation.startTime;
          const progress = Math.min(elapsed / animation.duration, 1);

          if (progress < 1) {
            activeAnimations.set(edgeId, animation);
          }
        });

        animationsRef.current = activeAnimations;

        if (activeAnimations.size > 0) {
          frameRef.current = requestAnimationFrame(animate);
        }
      };

      frameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [edges, animatePathChanges]);

  const getAnimatedPath = (edgeId: string, defaultPath: string): string => {
    const animation = animationsRef.current.get(edgeId);
    if (!animation) return defaultPath;

    const elapsed = performance.now() - animation.startTime;
    const progress = Math.min(elapsed / animation.duration, 1);
    
    // Easing function for smooth animation
    const eased = 1 - Math.pow(1 - progress, 3); // Cubic ease-out

    if (eased >= 1) {
      animationsRef.current.delete(edgeId);
      return defaultPath;
    }

    // Simple interpolation between old and new paths
    // In a real implementation, you'd want more sophisticated path morphing
    return defaultPath;
  };

  // Provide animation context to children
  return (
    <div data-edge-animation-context="true">
      {children}
    </div>
  );
};

export default EdgeAnimationHandler;
