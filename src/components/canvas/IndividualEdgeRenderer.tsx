
import React from 'react';
import { EnhancedEdge } from '../../types/edgeTypes';
import { EnhancedNode } from '../../types/nodeTypes';
import { calculateEnhancedOrthogonalPath } from '../../utils/enhancedEdgeCalculations';

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
  onEdgeClick: (e: React.MouseEvent, edgeId: string) => void;
  onEdgeDoubleClick: (e: React.MouseEvent, edgeId: string) => void;
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
  onEdgeClick,
  onEdgeDoubleClick
}) => {
  try {
    const waypoints = calculateEnhancedOrthogonalPath(sourceNode, targetNode);
    const pathString = waypoints.map((point) => `${point.x},${point.y}`).join(' ');
    
    let strokeColor = "#10b981";
    let strokeWidth = "2";
    let markerEnd = "url(#arrowhead-enhanced)";
    
    if (isSelected || isMultiSelected) {
      strokeColor = "#3b82f6";
      strokeWidth = "3";
      markerEnd = "url(#arrowhead-enhanced-selected)";
    } else if (validationClass === 'validation-error') {
      strokeColor = "#dc2626";
      strokeWidth = "3";
      markerEnd = "url(#arrowhead-enhanced-error)";
    } else if (validationClass === 'validation-warning') {
      strokeColor = "#d97706";
      strokeWidth = "3";
      markerEnd = "url(#arrowhead-enhanced-warning)";
    }
    
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
          onDoubleClick={(e) => onEdgeDoubleClick(e, edge.id)}
        />
        {/* Visible edge with animation support */}
        <polyline
          points={pathString}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          markerEnd={markerEnd}
          style={{ 
            pointerEvents: 'none',
            opacity: animatedOpacity,
            transition: animatePathChanges ? 'opacity 0.3s ease-out' : 'none'
          }}
          className={`${animatePathChanges ? 'transition-all duration-300' : 'transition-all duration-200'} ${(isSelected || isMultiSelected) ? '' : 'hover:brightness-125'}`}
        />
        {tooltip && <title>{tooltip}</title>}
      </g>
    );
  } catch (error) {
    console.warn('Enhanced pathfinding failed for edge:', edge.id, error);
    return null;
  }
};

export default IndividualEdgeRenderer;
