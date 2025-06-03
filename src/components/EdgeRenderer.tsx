
import React from 'react';
import { Edge } from '../hooks/useEdges';
import { Node } from '../hooks/useNodes';

interface EdgeRendererProps {
  edges: Edge[];
  nodes: Node[];
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
  const getNodeCenter = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    
    // Node dimensions from Node.tsx
    const nodeWidth = 120;
    const nodeHeight = 60;
    
    return {
      x: node.x + nodeWidth / 2,
      y: node.y + nodeHeight / 2
    };
  };

  const getConnectionPoints = (sourceId: string, targetId: string) => {
    const source = getNodeCenter(sourceId);
    const target = getNodeCenter(targetId);
    
    // Calculate direction and adjust start/end points to node edges
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return { start: source, end: target };
    
    const unitX = dx / distance;
    const unitY = dy / distance;
    
    // Offset from center to edge of node
    const nodeRadius = 30; // Half of the smaller dimension
    
    return {
      start: {
        x: source.x + unitX * nodeRadius,
        y: source.y + unitY * nodeRadius
      },
      end: {
        x: target.x - unitX * nodeRadius,
        y: target.y - unitY * nodeRadius
      }
    };
  };

  const handleEdgeClick = (e: React.MouseEvent, edgeId: string) => {
    e.stopPropagation();
    onSelectEdge(selectedEdgeId === edgeId ? null : edgeId);
  };

  if (edges.length === 0) return null;

  return (
    <svg 
      className="absolute inset-0 pointer-events-none z-0" 
      style={{ width: '100%', height: '100%' }}
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
        const { start, end } = getConnectionPoints(edge.source, edge.target);
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
            <line
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              markerEnd={markerEnd}
              className="pointer-events-auto cursor-pointer hover:stroke-blue-500"
              onClick={(e) => handleEdgeClick(e, edge.id)}
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
