
import React from 'react';
import { EnhancedEdge } from '../types/edgeTypes';
import { EnhancedNode } from '../types/nodeTypes';
import { calculateEnhancedOrthogonalPath } from '../utils/enhancedEdgeCalculations';
import GridDebugOverlay from './canvas/GridDebugOverlay';
import { getEnhancedEdgeCalculator } from '../utils/enhancedEdgeCalculations';
import { usePathfindingSettings } from '../hooks/usePathfindingSettings';

interface EnhancedEdgeRendererProps {
  edges: EnhancedEdge[];
  nodes: EnhancedNode[];
  selectedEdgeId: string | null;
  selectedEdgeIds?: string[];
  onSelectSingleEdge?: (edgeId: string | null) => void;
  onToggleEdgeSelection?: (edgeId: string, isCtrlOrShiftPressed: boolean) => void;
  onDoubleClick?: (edgeId: string) => void;
  onSelectEdge?: (edgeId: string | null) => void;
  getEdgeValidationClass?: (edgeId: string) => string;
  getEdgeTooltip?: (edgeId: string) => string;
}

const EnhancedEdgeRenderer: React.FC<EnhancedEdgeRendererProps> = ({ 
  edges, 
  nodes, 
  selectedEdgeId, 
  selectedEdgeIds = [],
  onSelectSingleEdge,
  onToggleEdgeSelection,
  onDoubleClick,
  onSelectEdge,
  getEdgeValidationClass,
  getEdgeTooltip
}) => {
  const { settings } = usePathfindingSettings();

  const handleEdgeClick = (e: React.MouseEvent, edgeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isCtrlOrShiftPressed = e.ctrlKey || e.shiftKey || e.metaKey;
    
    if (onToggleEdgeSelection && isCtrlOrShiftPressed) {
      onToggleEdgeSelection(edgeId, true);
    } else if (onSelectSingleEdge) {
      onSelectSingleEdge(selectedEdgeId === edgeId ? null : edgeId);
    } else if (onSelectEdge) {
      // Fallback to legacy prop
      onSelectEdge(selectedEdgeId === edgeId ? null : edgeId);
    }
    
    console.log(`🔗 Enhanced edge clicked: ${edgeId}`);
  };

  const handleEdgeDoubleClick = (e: React.MouseEvent, edgeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onDoubleClick) {
      onDoubleClick(edgeId);
    }
  };

  if (edges.length === 0 && !settings.enableDebugGrid) return null;

  return (
    <svg 
      className="absolute inset-0 z-10" 
      style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <defs>
        <marker
          id="arrowhead-enhanced"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
        </marker>
        <marker
          id="arrowhead-enhanced-selected"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
        </marker>
        <marker
          id="arrowhead-enhanced-error"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#dc2626" />
        </marker>
        <marker
          id="arrowhead-enhanced-warning"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#d97706" />
        </marker>
      </defs>
      
      {/* Debug grid overlay */}
      {settings.enableDebugGrid && (
        <GridDebugOverlay 
          grid={getEnhancedEdgeCalculator().getGridSystem()} 
          visible={settings.enableDebugGrid}
          opacity={0.2}
        />
      )}
      
      {edges.map(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        
        if (!sourceNode || !targetNode) return null;
        
        try {
          // Use enhanced A* pathfinding
          const waypoints = calculateEnhancedOrthogonalPath(sourceNode, targetNode);
          const pathString = waypoints.map((point, index) => 
            `${point.x},${point.y}`
          ).join(' ');
          
          const isSelected = selectedEdgeId === edge.id;
          const isMultiSelected = selectedEdgeIds.includes(edge.id);
          const validationClass = getEdgeValidationClass?.(edge.id) || '';
          const tooltip = getEdgeTooltip?.(edge.id) || '';
          
          let strokeColor = "#10b981"; // Enhanced green color
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
                onClick={(e) => handleEdgeClick(e, edge.id)}
                onDoubleClick={(e) => handleEdgeDoubleClick(e, edge.id)}
              />
              {/* Visible edge */}
              <polyline
                points={pathString}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinejoin="round"
                markerEnd={markerEnd}
                style={{ pointerEvents: 'none' }}
                className={`transition-all duration-200 ${(isSelected || isMultiSelected) ? '' : 'hover:brightness-125'}`}
              />
              {tooltip && (
                <title>{tooltip}</title>
              )}
            </g>
          );
        } catch (error) {
          console.warn('Enhanced pathfinding failed for edge:', edge.id, error);
          return null;
        }
      })}
    </svg>
  );
};

export default EnhancedEdgeRenderer;
