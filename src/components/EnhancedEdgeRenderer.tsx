import React from 'react';
import { EnhancedEdge } from '../types/edgeTypes';
import { EnhancedNode } from '../types/nodeTypes';

interface EnhancedEdgeRendererProps {
  edges: EnhancedEdge[];
  nodes: EnhancedNode[];
  selectedEdgeId: string | null;
  onSelectEdge: (edgeId: string | null) => void;
  onDoubleClick?: (edgeId: string) => void;
  getEdgeValidationClass?: (edgeId: string) => string;
  getEdgeTooltip?: (edgeId: string) => string;
}

const EnhancedEdgeRenderer: React.FC<EnhancedEdgeRendererProps> = ({
  edges,
  nodes,
  selectedEdgeId,
  onSelectEdge,
  onDoubleClick,
  getEdgeValidationClass,
  getEdgeTooltip
}) => {
  const getNodePosition = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  const calculateLinePosition = (sourceX: number, sourceY: number, targetX: number, targetY: number) => {
    const startX = sourceX + 60;
    const startY = sourceY + 30;
    const endX = targetX + 60;
    const endY = targetY + 30;

    return { startX, startY, endX, endY };
  };

  const getEdgeStyle = (edgeId: string) => {
    if (selectedEdgeId === edgeId) {
      return {
        strokeColor: 'rgb(59, 130, 246)',
        strokeWidth: '3',
        strokePattern: 'none'
      };
    } else {
      return {
        strokeColor: 'rgb(75, 85, 99)',
        strokeWidth: '2',
        strokePattern: '4'
      };
    }
  };

  const handleEdgeClick = (event: React.MouseEvent, edgeId: string) => {
    event.preventDefault();
    event.stopPropagation();
    console.log(`🔗 Edge clicked: ${edgeId}`);
    onSelectEdge(edgeId);
  };

  const handleEdgeDoubleClick = (event: React.MouseEvent, edgeId: string) => {
    event.preventDefault();
    event.stopPropagation();
    console.log(`🔗 Edge double-clicked: ${edgeId}`);
    if (onDoubleClick) {
      onDoubleClick(edgeId);
    }
  };

  if (!edges || edges.length === 0) {
    return null;
  }

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-1"
      style={{ width: '100%', height: '100%' }}
    >
      {edges.map((edge) => {
        const sourceNode = nodes.find((node) => node.id === edge.source);
        const targetNode = nodes.find((node) => node.id === edge.target);

        if (!sourceNode || !targetNode) {
          return null;
        }

        const { x: sourceX, y: sourceY } = getNodePosition(edge.source);
        const { x: targetX, y: targetY } = getNodePosition(edge.target);
        const { startX, startY, endX, endY } = calculateLinePosition(sourceX, sourceY, targetX, targetY);
        const { strokeColor, strokeWidth, strokePattern } = getEdgeStyle(edge.id);
        const isSelected = selectedEdgeId === edge.id;
        const validationClass = getEdgeValidationClass?.(edge.id) || '';
        const tooltip = getEdgeTooltip?.(edge.id) || '';

        return (
          <g key={edge.id}>
            <line
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={strokePattern}
              className={`pointer-events-auto cursor-pointer ${validationClass}`}
              onClick={(e) => handleEdgeClick(e, edge.id)}
              onDoubleClick={(e) => handleEdgeDoubleClick(e, edge.id)}
              title={tooltip}
            />
            {isSelected && (
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke="rgba(59, 130, 246, 0.3)"
                strokeWidth="8"
                className="pointer-events-none"
              />
            )}
            <marker id="arrowhead" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={strokeColor} />
            </marker>
            <line
              x1={endX - 10}
              y1={endY - 10}
              x2={endX}
              y2={endY}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              markerEnd="url(#arrowhead)"
              className="pointer-events-none"
            />
            {edge.label && (
              <text
                x={(startX + endX) / 2}
                y={(startY + endY) / 2 - 10}
                fontSize="12"
                fill="#6b7280"
                textAnchor="middle"
                className="pointer-events-none"
              >
                {edge.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

export default EnhancedEdgeRenderer;
