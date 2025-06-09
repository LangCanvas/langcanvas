
import React from 'react';
import { EnhancedEdge } from '../types/edgeTypes';
import { EnhancedNode } from '../types/nodeTypes';
import { getConnectionPoints, calculateOrthogonalPath } from '../utils/edgeCalculations';

interface EnhancedEdgeRendererProps {
  edges: EnhancedEdge[];
  nodes: EnhancedNode[];
  selectedEdgeId: string | null;
  onSelectEdge: (edgeId: string | null) => void;
  getEdgeValidationClass?: (edgeId: string) => string;
  getEdgeTooltip?: (edgeId: string) => string;
}

const EnhancedEdgeRenderer: React.FC<EnhancedEdgeRendererProps> = ({ 
  edges, 
  nodes, 
  selectedEdgeId, 
  onSelectEdge,
  getEdgeValidationClass,
  getEdgeTooltip
}) => {
  const handleEdgeClick = (e: React.MouseEvent, edgeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`🔗 Edge clicked: ${edgeId}`);
    onSelectEdge(selectedEdgeId === edgeId ? null : edgeId);
  };

  const calculateLabelPosition = (waypoints: { x: number, y: number }[]) => {
    if (waypoints.length < 2) return { x: 0, y: 0 };
    
    // Find the middle segment for label placement
    const midIndex = Math.floor(waypoints.length / 2);
    const p1 = waypoints[midIndex - 1] || waypoints[0];
    const p2 = waypoints[midIndex] || waypoints[waypoints.length - 1];
    
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2
    };
  };

  if (edges.length === 0) return null;

  return (
    <svg 
      className="absolute inset-0 z-10" 
      style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#374151" />
        </marker>
        <marker
          id="arrowhead-selected"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
        </marker>
        <marker
          id="arrowhead-conditional"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#ea580c" />
        </marker>
        <marker
          id="arrowhead-error"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#dc2626" />
        </marker>
      </defs>
      
      {edges.map(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        
        if (!sourceNode || !targetNode) return null;
        
        const waypoints = calculateOrthogonalPath(sourceNode, targetNode);
        const pathString = waypoints.map((point, index) => 
          `${point.x},${point.y}`
        ).join(' ');
        
        const isSelected = selectedEdgeId === edge.id;
        const isConditional = edge.conditional;
        const validationClass = getEdgeValidationClass?.(edge.id) || '';
        const tooltip = getEdgeTooltip?.(edge.id) || '';
        
        let strokeColor = "#374151";
        let strokeWidth = "2";
        let markerEnd = "url(#arrowhead)";
        
        if (isSelected) {
          strokeColor = "#3b82f6";
          strokeWidth = "3";
          markerEnd = "url(#arrowhead-selected)";
        } else if (isConditional) {
          strokeColor = "#ea580c";
          strokeWidth = "2";
          markerEnd = "url(#arrowhead-conditional)";
        }
        
        if (validationClass === 'validation-error') {
          strokeColor = "#dc2626";
          strokeWidth = "3";
          markerEnd = "url(#arrowhead-error)";
        }

        const labelPosition = calculateLabelPosition(waypoints);
        const label = edge.label || (isConditional ? edge.conditional?.condition.functionName : '');
        
        return (
          <g key={edge.id}>
            {/* Invisible thick polyline for easier clicking */}
            <polyline
              points={pathString}
              fill="none"
              stroke="transparent"
              strokeWidth="12"
              strokeLinejoin="round"
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
              onClick={(e) => handleEdgeClick(e, edge.id)}
            />
            {/* Visible polyline */}
            <polyline
              points={pathString}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
              markerEnd={markerEnd}
              strokeDasharray={isConditional && !isSelected ? "5,3" : "none"}
              style={{ pointerEvents: 'none' }}
              className={isSelected ? '' : 'hover:brightness-125'}
            />
            {/* Edge Label */}
            {label && (
              <g>
                <rect
                  x={labelPosition.x - (label.length * 3)}
                  y={labelPosition.y - 8}
                  width={label.length * 6}
                  height={16}
                  fill={isConditional ? "#fff7ed" : "#f8fafc"}
                  stroke={isConditional ? "#ea580c" : "#64748b"}
                  strokeWidth="1"
                  rx="3"
                />
                <text
                  x={labelPosition.x}
                  y={labelPosition.y + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fill={isConditional ? "#9a3412" : "#475569"}
                  fontWeight={isConditional ? "600" : "500"}
                  style={{ pointerEvents: 'none' }}
                >
                  {label}
                </text>
                {isConditional && (
                  <circle
                    cx={labelPosition.x + (label.length * 3) - 6}
                    cy={labelPosition.y - 4}
                    r="3"
                    fill="#ea580c"
                  />
                )}
              </g>
            )}
            {tooltip && (
              <title>{tooltip}</title>
            )}
          </g>
        );
      })}
    </svg>
  );
};

export default EnhancedEdgeRenderer;
