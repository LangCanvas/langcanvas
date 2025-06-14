
import React from 'react';
import { EnhancedEdge } from '../../types/edgeTypes';
import { EnhancedNode } from '../../types/nodeTypes';
import { MultiEdgeCalculator, MultiEdgeGroup } from '../../utils/multiEdgeCalculations';

interface MultiEdgeRendererProps {
  multiEdgeGroups: MultiEdgeGroup[];
  nodes: EnhancedNode[];
  selectedEdgeIds: string[];
  onEdgeClick: (e: React.MouseEvent, edgeId: string) => void;
  onEdgeDoubleClick: (e: React.MouseEvent, edgeId: string) => void;
  getEdgeValidationClass?: (edgeId: string) => string;
  getEdgeTooltip?: (edgeId: string) => string;
}

const MultiEdgeRenderer: React.FC<MultiEdgeRendererProps> = ({
  multiEdgeGroups,
  nodes,
  selectedEdgeIds,
  onEdgeClick,
  onEdgeDoubleClick,
  getEdgeValidationClass,
  getEdgeTooltip
}) => {
  const getEdgeColor = (edge: EnhancedEdge, isSelected: boolean): string => {
    if (isSelected) return "#3b82f6";
    
    const validationClass = getEdgeValidationClass?.(edge.id) || '';
    if (validationClass === 'validation-error') return "#dc2626";
    if (validationClass === 'validation-warning') return "#d97706";
    
    return "#10b981";
  };

  const getEdgeStrokeWidth = (edge: EnhancedEdge, isSelected: boolean): string => {
    const baseWidth = MultiEdgeCalculator.getEdgeConnectionStrength(edge);
    return isSelected ? String(baseWidth + 1) : String(baseWidth);
  };

  return (
    <g className="multi-edges">
      {multiEdgeGroups.map(group => {
        const sourceNode = nodes.find(n => n.id === group.sourceId);
        const targetNode = nodes.find(n => n.id === group.targetId);
        
        if (!sourceNode || !targetNode) return null;
        
        return (
          <g key={`${group.sourceId}-${group.targetId}`} className="multi-edge-group">
            {group.edges.map((edge, edgeIndex) => {
              const isSelected = selectedEdgeIds.includes(edge.id);
              const strokeColor = getEdgeColor(edge, isSelected);
              const strokeWidth = getEdgeStrokeWidth(edge, isSelected);
              const tooltip = getEdgeTooltip?.(edge.id) || '';
              
              const waypoints = MultiEdgeCalculator.calculateParallelEdgePath(
                sourceNode,
                targetNode,
                edgeIndex,
                group.edges.length
              );
              
              const pathString = waypoints.map(point => `${point.x},${point.y}`).join(' ');
              
              return (
                <g key={edge.id} className="multi-edge">
                  {/* Invisible hit area */}
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
                  {/* Visible edge */}
                  <polyline
                    points={pathString}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinejoin="round"
                    markerEnd={isSelected ? "url(#arrowhead-enhanced-selected)" : "url(#arrowhead-enhanced)"}
                    style={{ 
                      pointerEvents: 'none',
                      opacity: isSelected ? 1 : 0.8,
                      transition: 'all 0.2s ease-out'
                    }}
                    className={`multi-edge-path ${isSelected ? 'selected' : ''} transition-all duration-200 hover:brightness-125`}
                  />
                  {/* Edge label for multiple edges */}
                  {group.edges.length > 1 && edgeIndex === 0 && (
                    <text
                      x={waypoints[Math.floor(waypoints.length / 2)]?.x || 0}
                      y={waypoints[Math.floor(waypoints.length / 2)]?.y || 0}
                      textAnchor="middle"
                      dy="-8"
                      fontSize="10"
                      fill={strokeColor}
                      fontWeight="bold"
                      style={{ pointerEvents: 'none' }}
                    >
                      {group.edges.length}x
                    </text>
                  )}
                  {tooltip && <title>{tooltip}</title>}
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
};

export default MultiEdgeRenderer;
