
import React from 'react';
import { EnhancedEdge } from '../../types/edgeTypes';
import { EnhancedNode } from '../../types/nodeTypes';
import IndividualEdgeRenderer from './IndividualEdgeRenderer';
import { EdgePerformanceOptimizer } from '../../utils/edgePerformance';

interface IndividualEdgesRendererProps {
  edges: EnhancedEdge[];
  nodes: EnhancedNode[];
  selectedEdgeId: string | null;
  selectedEdgeIds: string[];
  hoveredEdgeId: string | null;
  lodLevel: 'high' | 'medium' | 'low';
  settings: any;
  getAnimationProgress: (edgeId: string, type?: string) => number;
  isAnimating: (edgeId: string, type?: string) => boolean;
  setEdgeHover: (edgeId: string | null) => void;
  startDataFlow: (edgeId: string, particleCount?: number) => void;
  stopDataFlow: (edgeId: string) => void;
  getDataFlowParticles: (edgeId: string) => any[];
  onEdgeClick: (e: React.MouseEvent, edgeId: string) => void;
  onEdgeDoubleClick: (e: React.MouseEvent, edgeId: string) => void;
  getEdgeValidationClass?: (edgeId: string) => string;
  getEdgeTooltip?: (edgeId: string) => string;
}

const IndividualEdgesRenderer: React.FC<IndividualEdgesRendererProps> = ({
  edges,
  nodes,
  selectedEdgeId,
  selectedEdgeIds,
  hoveredEdgeId,
  lodLevel,
  settings,
  getAnimationProgress,
  isAnimating,
  setEdgeHover,
  startDataFlow,
  stopDataFlow,
  getDataFlowParticles,
  onEdgeClick,
  onEdgeDoubleClick,
  getEdgeValidationClass,
  getEdgeTooltip
}) => {
  return (
    <>
      {EdgePerformanceOptimizer.optimizeRenderList(
        edges,
        edge => edge.id,
        () => true,
        lodLevel === 'low' ? 50 : lodLevel === 'medium' ? 100 : 200
      ).map(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        
        if (!sourceNode || !targetNode) return null;
        
        const isSelected = selectedEdgeId === edge.id;
        const isMultiSelected = selectedEdgeIds.includes(edge.id);
        const isHovered = hoveredEdgeId === edge.id;
        const validationClass = getEdgeValidationClass?.(edge.id) || '';
        const tooltip = getEdgeTooltip?.(edge.id) || '';
        
        // Get animation progress
        const creationProgress = getAnimationProgress(edge.id, 'create');
        const updateProgress = getAnimationProgress(edge.id, 'update');
        const hoverProgress = getAnimationProgress(edge.id, 'hover');
        
        // Calculate animated opacity and scale
        const baseOpacity = isAnimating(edge.id, 'create') ? creationProgress : 1;
        const hoverOpacity = isHovered ? 0.8 + (0.2 * hoverProgress) : 1;
        const animatedOpacity = baseOpacity * hoverOpacity;
        
        return (
          <IndividualEdgeRenderer
            key={edge.id}
            edge={edge}
            sourceNode={sourceNode}
            targetNode={targetNode}
            isSelected={isSelected}
            isMultiSelected={isMultiSelected}
            validationClass={validationClass}
            tooltip={tooltip}
            animatedOpacity={animatedOpacity}
            animatePathChanges={settings.animatePathChanges}
            lodLevel={lodLevel}
            onEdgeClick={onEdgeClick}
            onEdgeDoubleClick={onEdgeDoubleClick}
            onEdgeHover={setEdgeHover}
            startDataFlow={startDataFlow}
            stopDataFlow={stopDataFlow}
            dataFlowParticles={getDataFlowParticles(edge.id)}
          />
        );
      })}
    </>
  );
};

export default IndividualEdgesRenderer;
