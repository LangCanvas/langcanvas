
import React from 'react';
import { EnhancedEdge } from '../../types/edgeTypes';
import { EnhancedNode } from '../../types/nodeTypes';
import { calculateEnhancedOrthogonalPath } from '../../utils/enhancedEdgeCalculations';
import { useLoopManagement } from '../../hooks/useLoopManagement';

interface LoopEdgeRendererProps {
  edge: EnhancedEdge;
  sourceNode: EnhancedNode;
  targetNode: EnhancedNode;
  isSelected: boolean;
  animatedOpacity: number;
  onEdgeClick: (e: React.MouseEvent, edgeId: string) => void;
  onEdgeDoubleClick: (e: React.MouseEvent, edgeId: string) => void;
  onEdgeHover?: (edgeId: string | null) => void;
}

const LoopEdgeRenderer: React.FC<LoopEdgeRendererProps> = ({
  edge,
  sourceNode,
  targetNode,
  isSelected,
  animatedOpacity,
  onEdgeClick,
  onEdgeDoubleClick,
  onEdgeHover
}) => {
  const { getLoopSafetyStatus, getLoopDisplayLabel } = useLoopManagement();
  
  if (!edge.loop) return null;

  const waypoints = calculateEnhancedOrthogonalPath(sourceNode, targetNode);
  const pathString = waypoints.map((point) => `${point.x},${point.y}`).join(' ');
  const safetyStatus = getLoopSafetyStatus(edge);
  const displayLabel = getLoopDisplayLabel(edge);
  
  // Loop-specific styling
  const getLoopColor = () => {
    if (isSelected) return "#3b82f6";
    if (safetyStatus.status === 'dangerous') return "#dc2626";
    if (safetyStatus.status === 'warning') return "#d97706";
    return "#8b5cf6"; // Purple for loop edges
  };

  const getLoopStrokeWidth = () => {
    return isSelected ? 4 : 3;
  };

  const getLoopPattern = () => {
    // Different dash patterns for different loop types
    switch (edge.loop.loopType) {
      case 'conditional': return "8,4";
      case 'self-loop': return "12,6";
      case 'human-in-loop': return "6,2,6,2";
      case 'tool-based': return "10,3,3,3";
      default: return "none";
    }
  };

  const strokeColor = getLoopColor();
  const strokeWidth = getLoopStrokeWidth();
  const strokeDasharray = getLoopPattern();

  // Calculate label position (midpoint of path)
  const midIndex = Math.floor(waypoints.length / 2);
  const labelPosition = waypoints[midIndex] || waypoints[0];

  return (
    <g className="loop-edge-group">
      {/* Loop flow animation background */}
      <polyline
        points={pathString}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth + 2}
        strokeOpacity="0.3"
        strokeDasharray={strokeDasharray}
        style={{
          animation: 'loop-flow 2s linear infinite',
          pointerEvents: 'none'
        }}
      />
      
      {/* Invisible hit area */}
      <polyline
        points={pathString}
        fill="none"
        stroke="transparent"
        strokeWidth="12"
        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
        onClick={(e) => onEdgeClick(e, edge.id)}
        onDoubleClick={(e) => onEdgeDoubleClick(e, edge.id)}
        onMouseEnter={() => onEdgeHover?.(edge.id)}
        onMouseLeave={() => onEdgeHover?.(null)}
      />
      
      {/* Main loop edge */}
      <polyline
        points={pathString}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        markerEnd="url(#arrowhead-loop)"
        style={{
          opacity: animatedOpacity,
          pointerEvents: 'none',
          filter: isSelected ? 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.4))' : 'none'
        }}
      />
      
      {/* Loop type badge */}
      <g transform={`translate(${labelPosition.x - 30}, ${labelPosition.y - 15})`}>
        <rect
          x="0"
          y="0"
          width="60"
          height="20"
          rx="10"
          fill={strokeColor}
          fillOpacity="0.9"
        />
        <text
          x="30"
          y="13"
          textAnchor="middle"
          fontSize="10"
          fill="white"
          fontWeight="bold"
        >
          🔄 {edge.loop.loopType.split('-')[0].toUpperCase()}
        </text>
      </g>
      
      {/* Safety indicator */}
      {safetyStatus.status !== 'safe' && (
        <g transform={`translate(${labelPosition.x + 35}, ${labelPosition.y - 10})`}>
          <circle
            cx="0"
            cy="0"
            r="8"
            fill={safetyStatus.status === 'dangerous' ? "#dc2626" : "#d97706"}
          />
          <text
            x="0"
            y="3"
            textAnchor="middle"
            fontSize="10"
            fill="white"
            fontWeight="bold"
          >
            {safetyStatus.status === 'dangerous' ? '⚠' : '!'}
          </text>
        </g>
      )}
      
      {/* Iteration counter for active loops */}
      {edge.loop.loopCondition.iterationCounter && edge.loop.loopCondition.iterationCounter > 0 && (
        <g transform={`translate(${labelPosition.x - 50}, ${labelPosition.y + 15})`}>
          <rect
            x="0"
            y="0"
            width="40"
            height="16"
            rx="8"
            fill="#10b981"
            fillOpacity="0.8"
          />
          <text
            x="20"
            y="11"
            textAnchor="middle"
            fontSize="8"
            fill="white"
            fontWeight="bold"
          >
            #{edge.loop.loopCondition.iterationCounter}
          </text>
        </g>
      )}
    </g>
  );
};

export default LoopEdgeRenderer;
