
import React, { useEffect, useRef } from 'react';
import { EnhancedEdge } from '../../types/edgeTypes';
import { EnhancedNode } from '../../types/nodeTypes';
import { useEdgeAnimations } from '../../hooks/useEdgeAnimations';
import DataFlowAnimations from './DataFlowAnimations';

interface EdgeAnimationHandlerProps {
  edges: EnhancedEdge[];
  nodes: EnhancedNode[];
  children: (animationProps: {
    getAnimationProgress: (edgeId: string, type?: 'create' | 'delete' | 'update' | 'flow' | 'hover') => number;
    isAnimating: (edgeId: string, type?: 'create' | 'delete' | 'update' | 'flow' | 'hover') => boolean;
    hoveredEdgeId: string | null;
    setEdgeHover: (edgeId: string | null) => void;
    startDataFlow: (edgeId: string, particleCount?: number) => void;
    stopDataFlow: (edgeId: string) => void;
    getDataFlowParticles: (edgeId: string) => any[];
  }) => React.ReactNode;
  animatePathChanges?: boolean;
  enableDataFlow?: boolean;
}

const EdgeAnimationHandler: React.FC<EdgeAnimationHandlerProps> = ({
  edges,
  nodes,
  children,
  animatePathChanges = true,
  enableDataFlow = false
}) => {
  const previousEdgesRef = useRef<EnhancedEdge[]>([]);
  
  const {
    getAnimationProgress,
    isAnimating,
    hoveredEdgeId,
    setEdgeHover,
    startDataFlow,
    stopDataFlow,
    getDataFlowParticles,
    animateEdgeCreation,
    animateEdgeDeletion
  } = useEdgeAnimations(edges, animatePathChanges);

  useEffect(() => {
    if (!animatePathChanges) {
      previousEdgesRef.current = edges;
      return;
    }

    const previousEdges = previousEdgesRef.current;
    const currentEdgeIds = new Set(edges.map(e => e.id));
    const previousEdgeIds = new Set(previousEdges.map(e => e.id));

    // Animate deleted edges
    previousEdges.forEach(edge => {
      if (!currentEdgeIds.has(edge.id)) {
        animateEdgeDeletion(edge.id);
      }
    });

    previousEdgesRef.current = edges;
  }, [edges, animatePathChanges, animateEdgeDeletion]);

  return (
    <div data-edge-animation-context="true">
      {children({
        getAnimationProgress,
        isAnimating,
        hoveredEdgeId,
        setEdgeHover,
        startDataFlow: enableDataFlow ? startDataFlow : () => {},
        stopDataFlow: enableDataFlow ? stopDataFlow : () => {},
        getDataFlowParticles: enableDataFlow ? getDataFlowParticles : () => []
      })}
      
      {/* Render data flow particles if enabled */}
      {enableDataFlow && (
        <svg className="absolute inset-0 z-20 pointer-events-none">
          {edges.map(edge => {
            const particles = getDataFlowParticles(edge.id);
            if (particles.length === 0) return null;
            
            // Calculate path points for this edge
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            
            if (!sourceNode || !targetNode) return null;
            
            const pathPoints = edge.waypoints || [
              { x: sourceNode.x + sourceNode.width / 2, y: sourceNode.y + sourceNode.height / 2 },
              { x: targetNode.x + targetNode.width / 2, y: targetNode.y + targetNode.height / 2 }
            ];
            
            return (
              <DataFlowAnimations
                key={`flow-${edge.id}`}
                particles={particles}
                pathPoints={pathPoints}
                color="#3b82f6"
                size={3}
              />
            );
          })}
        </svg>
      )}
    </div>
  );
};

export default EdgeAnimationHandler;
