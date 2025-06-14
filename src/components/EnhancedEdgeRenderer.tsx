
import React from 'react';
import { EnhancedEdge } from '../types/edgeTypes';
import { EnhancedNode } from '../types/nodeTypes';
import { getOrthogonalConnectionPoints } from '../utils/edgeCalculations';

interface EnhancedEdgeRendererProps {
  edges: EnhancedEdge[];
  nodes: EnhancedNode[];
  selectedEdgeId: string | null;
  selectedEdgeIds: string[];
  onSelectSingleEdge: (edgeId: string | null) => void;
  onToggleEdgeSelection: (edgeId: string, isCtrlOrShiftPressed: boolean) => void;
  onDoubleClick?: (edgeId: string) => void;
  getEdgeValidationClass?: (edgeId: string) => string;
  getEdgeTooltip?: (edgeId: string) => string;
}

const EnhancedEdgeRenderer: React.FC<EnhancedEdgeRendererProps> = ({
  edges,
  nodes,
  selectedEdgeId,
  selectedEdgeIds,
  onSelectSingleEdge,
  onToggleEdgeSelection,
  onDoubleClick,
  getEdgeValidationClass,
  getEdgeTooltip
}) => {
  const getNodePosition = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  const calculateLinePosition = (sourceNode: EnhancedNode, targetNode: EnhancedNode) => {
    const { start, end } = getOrthogonalConnectionPoints(sourceNode, targetNode);
    return { startX: start.x, startY: start.y, endX: end.x, endY: end.y };
  };

  const getEdgeStyle = (edgeId: string) => {
    const isPrimarySelected = selectedEdgeId === edgeId;
    const isMultiSelected = selectedEdgeIds.includes(edgeId);

    if (isPrimarySelected) {
      return {
        strokeColor: 'rgb(37, 99, 235)',
        strokeWidth: '3.5',
        strokePattern: 'none'
      };
    } else if (isMultiSelected) {
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
    const isCtrlOrShiftPressed = event.ctrlKey || event.metaKey || event.shiftKey;

    console.log(`🔗 Edge clicked: ${edgeId}, Ctrl/Shift: ${isCtrlOrShiftPressed}`);
    if (isCtrlOrShiftPressed) {
      onToggleEdgeSelection(edgeId, true);
    } else {
      onSelectSingleEdge(edgeId);
    }
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
      <defs>
        <marker id="arrowhead" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgb(75, 85, 99)" />
        </marker>
         <marker id="arrowhead-selected" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgb(59, 130, 246)" />
        </marker>
        <marker id="arrowhead-primary-selected" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgb(37, 99, 235)" />
        </marker>
      </defs>
      
      {edges.map((edge) => {
        const sourceNode = nodes.find((node) => node.id === edge.source);
        const targetNode = nodes.find((node) => node.id === edge.target);

        if (!sourceNode || !targetNode) {
          return null;
        }

        const { startX, startY, endX, endY } = calculateLinePosition(sourceNode, targetNode);
        const { strokeColor, strokeWidth, strokePattern } = getEdgeStyle(edge.id);
        
        const isPrimarySelected = selectedEdgeId === edge.id;
        const isMultiSelected = selectedEdgeIds.includes(edge.id);
        let markerEndUrl = "url(#arrowhead)";
        if (isPrimarySelected) {
            markerEndUrl = "url(#arrowhead-primary-selected)";
        } else if (isMultiSelected) {
            markerEndUrl = "url(#arrowhead-selected)";
        }

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
              markerEnd={markerEndUrl}
              className={`pointer-events-auto cursor-pointer ${validationClass}`}
              onClick={(e) => handleEdgeClick(e, edge.id)}
              onDoubleClick={(e) => handleEdgeDoubleClick(e, edge.id)}
            >
              {tooltip && <title>{tooltip}</title>}
            </line>
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
