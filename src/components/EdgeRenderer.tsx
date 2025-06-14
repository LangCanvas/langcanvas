import React from 'react';
import { EnhancedEdge } from '../types/edgeTypes';
import { EnhancedNode } from '../types/nodeTypes';
import { calculateOrthogonalPath } from '../utils/edgeCalculations';

interface EdgeRendererProps {
  edges: EnhancedEdge[];
  nodes: EnhancedNode[];
  selectedEdgeId: string | null;
  onSelectEdge: (edgeId: string | null) => void;
  getEdgeValidationClass?: (edgeId: string) => string;
  getEdgeTooltip?: (edgeId: string) => string;
}

const EdgeRenderer: React.FC<EdgeRendererProps> = ({ 
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
          id="arrowhead-error"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#dc2626" />
        </marker>
        <marker
          id="arrowhead-warning"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#d97706" />
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
        const validationClass = getEdgeValidationClass?.(edge.id) || '';
        const tooltip = getEdgeTooltip?.(edge.id) || '';
        
        let strokeColor = "#374151";
        let strokeWidth = "2";
        let markerEnd = "url(#arrowhead)";
        
        if (isSelected) {
          strokeColor = "#3b82f6";
          strokeWidth = "3";
          markerEnd = "url(#arrowhead-selected)";
        } else if (validationClass === 'validation-error') {
          strokeColor = "#dc2626";
          strokeWidth = "3";
          markerEnd = "url(#arrowhead-error)";
        } else if (validationClass === 'validation-warning') {
          strokeColor = "#d97706";
          strokeWidth = "3";
          markerEnd = "url(#arrowhead-warning)";
        }
        
        return (
          <g key={edge.id}>
            <polyline
              points={pathString}
              fill="none"
              stroke="transparent"
              strokeWidth="12"
              strokeLinejoin="round"
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
              onClick={(e) => handleEdgeClick(e, edge.id)}
            />
            <polyline
              points={pathString}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
              markerEnd={markerEnd}
              style={{ pointerEvents: 'none' }}
              className={isSelected ? '' : 'hover:brightness-125'}
            />
            {tooltip && (
              <title>{tooltip}</title>
            )}
          </g>
        );
      })}
    </svg>
  );
};

export default EdgeRenderer;
