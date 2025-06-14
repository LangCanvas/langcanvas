
import React from 'react';
import { EnhancedEdge } from '../../types/edgeTypes';
import { EnhancedNode } from '../../types/nodeTypes';
import { calculateEnhancedOrthogonalPath } from '../../utils/enhancedEdgeCalculations';
import { EdgeLODManager } from '../../utils/edgePerformance';
import DataFlowAnimations from './DataFlowAnimations';
import LoopEdgeRenderer from './LoopEdgeRenderer';

interface IndividualEdgeRendererProps {
  edge: EnhancedEdge;
  sourceNode: EnhancedNode;
  targetNode: EnhancedNode;
  isSelected: boolean;
  isMultiSelected: boolean;
  validationClass: string;
  tooltip: string;
  animatedOpacity: number;
  animatePathChanges: boolean;
  lodLevel?: 'high' | 'medium' | 'low';
  onEdgeClick: (e: React.MouseEvent, edgeId: string) => void;
  onEdgeDoubleClick: (e: React.MouseEvent, edgeId: string) => void;
  onEdgeHover?: (edgeId: string | null) => void;
  startDataFlow?: (edgeId: string, particleCount?: number) => void;
  stopDataFlow?: (edgeId: string) => void;
  dataFlowParticles?: any[];
}

const IndividualEdgeRenderer: React.FC<IndividualEdgeRendererProps> = ({
  edge,
  sourceNode,
  targetNode,
  isSelected,
  isMultiSelected,
  validationClass,
  tooltip,
  animatedOpacity,
  animatePathChanges,
  lodLevel = 'high',
  onEdgeClick,
  onEdgeDoubleClick,
  onEdgeHover,
  startDataFlow,
  stopDataFlow,
  dataFlowParticles = []
}) => {
  // If this is a loop edge, render with the specialized loop renderer
  if (edge.loop) {
    return (
      <LoopEdgeRenderer
        edge={edge}
        sourceNode={sourceNode}
        targetNode={targetNode}
        isSelected={isSelected}
        animatedOpacity={animatedOpacity}
        onEdgeClick={onEdgeClick}
        onEdgeDoubleClick={onEdgeDoubleClick}
        onEdgeHover={onEdgeHover}
      />
    );
  }

  // Regular edge rendering logic
  try {
    const waypoints = calculateEnhancedOrthogonalPath(sourceNode, targetNode);
    const optimizedWaypoints = EdgeLODManager.getSimplifiedPath(waypoints, lodLevel);
    const pathString = optimizedWaypoints.map((point) => `${point.x},${point.y}`).join(' ');
    
    let strokeColor = "#10b981";
    let baseStrokeWidth = 2;
    let markerEnd = "url(#arrowhead-enhanced)";
    
    if (isSelected || isMultiSelected) {
      strokeColor = "#3b82f6";
      baseStrokeWidth = 3;
      markerEnd = "url(#arrowhead-enhanced-selected)";
    } else if (validationClass === 'validation-error') {
      strokeColor = "#dc2626";
      baseStrokeWidth = 3;
      markerEnd = "url(#arrowhead-enhanced-error)";
    } else if (validationClass === 'validation-warning') {
      strokeColor = "#d97706";
      baseStrokeWidth = 3;
      markerEnd = "url(#arrowhead-enhanced-warning)";
    }

    const strokeWidth = EdgeLODManager.getSimplifiedStrokeWidth(baseStrokeWidth, lodLevel);
    const showMarkers = EdgeLODManager.shouldShowMarkers(lodLevel);
    const finalMarkerEnd = showMarkers ? markerEnd : "none";
    
    const handleMouseEnter = () => {
      if (onEdgeHover && lodLevel === 'high') {
        onEdgeHover(edge.id);
      }
    };

    const handleMouseLeave = () => {
      if (onEdgeHover && lodLevel === 'high') {
        onEdgeHover(null);
      }
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
      onEdgeDoubleClick(e, edge.id);
      // Start data flow on double-click for demonstration
      if (startDataFlow && lodLevel === 'high') {
        startDataFlow(edge.id, 3);
        setTimeout(() => stopDataFlow?.(edge.id), 3000); // Stop after 3 seconds
      }
    };
    
    return (
      <g key={edge.id}>
        {/* Invisible hit area for clicking */}
        <polyline
          points={pathString}
          fill="none"
          stroke="transparent"
          strokeWidth="12"
          strokeLinejoin="round"
          style={{ pointerEvents: 'auto', cursor: 'pointer' }}
          onClick={(e) => onEdgeClick(e, edge.id)}
          onDoubleClick={handleDoubleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
        
        {/* Visible edge with animation support */}
        <polyline
          points={pathString}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          markerEnd={finalMarkerEnd}
          style={{ 
            pointerEvents: 'none',
            opacity: animatedOpacity,
            transition: animatePathChanges ? 'all 0.3s ease-out' : 'opacity 0.2s ease-out',
            filter: isSelected || isMultiSelected ? 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.4))' : 'none'
          }}
          className={`${animatePathChanges ? 'transition-all duration-300' : 'transition-opacity duration-200'} ${(isSelected || isMultiSelected) ? '' : 'hover:brightness-125'}`}
        />
        
        {/* Data flow particles */}
        {dataFlowParticles.length > 0 && lodLevel === 'high' && (
          <DataFlowAnimations
            particles={dataFlowParticles}
            pathPoints={optimizedWaypoints}
            color={strokeColor}
            size={2}
          />
        )}
        
        {tooltip && EdgeLODManager.shouldShowLabels(lodLevel) && <title>{tooltip}</title>}
      </g>
    );
  } catch (error) {
    console.warn('Enhanced pathfinding failed for edge:', edge.id, error);
    return null;
  }
};

export default IndividualEdgeRenderer;
