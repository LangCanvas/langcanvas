
import React from 'react';
import { BundleGroup } from '../../utils/edgeBundling';
import { EnhancedNode } from '../../types/nodeTypes';

interface BundledEdgeRendererProps {
  bundles: BundleGroup[];
  nodes: EnhancedNode[];
  selectedEdgeId: string | null;
  onSelectEdge?: (edgeId: string | null) => void;
  getEdgeValidationClass?: (edgeId: string) => string;
}

const BundledEdgeRenderer: React.FC<BundledEdgeRendererProps> = ({
  bundles,
  nodes,
  selectedEdgeId,
  onSelectEdge,
  getEdgeValidationClass
}) => {
  const handleBundleClick = (e: React.MouseEvent, bundleGroup: BundleGroup) => {
    e.preventDefault();
    e.stopPropagation();
    
    // For now, select the first edge in the bundle
    if (bundleGroup.edges.length > 0 && onSelectEdge) {
      onSelectEdge(bundleGroup.edges[0].id);
    }
  };

  const getBundleStrokeWidth = (bundleGroup: BundleGroup): number => {
    // Scale stroke width based on number of edges in bundle
    return Math.min(2 + bundleGroup.edges.length, 8);
  };

  const getBundleColor = (bundleGroup: BundleGroup): string => {
    // Check if any edge in bundle is selected
    const hasSelectedEdge = bundleGroup.edges.some(edge => edge.id === selectedEdgeId);
    if (hasSelectedEdge) return "#3b82f6";

    // Check for validation issues
    const hasError = bundleGroup.edges.some(edge => 
      getEdgeValidationClass?.(edge.id) === 'validation-error'
    );
    if (hasError) return "#dc2626";

    const hasWarning = bundleGroup.edges.some(edge => 
      getEdgeValidationClass?.(edge.id) === 'validation-warning'
    );
    if (hasWarning) return "#d97706";

    return "#10b981"; // Default bundle color
  };

  const getIndividualEdgePath = (bundleGroup: BundleGroup, edgeIndex: number): string => {
    if (bundleGroup.controlPoints.length < 2) return '';

    const totalEdges = bundleGroup.edges.length;
    const offset = (edgeIndex - (totalEdges - 1) / 2) * bundleGroup.separationDistance;
    
    // Calculate perpendicular offset for individual edges
    const start = bundleGroup.controlPoints[0];
    const end = bundleGroup.controlPoints[bundleGroup.controlPoints.length - 1];
    
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return '';
    
    const perpX = -dy / length * offset;
    const perpY = dx / length * offset;

    // Create path with offset
    const offsetPoints = bundleGroup.controlPoints.map(point => ({
      x: point.x + perpX,
      y: point.y + perpY
    }));

    if (offsetPoints.length === 2) {
      return `M ${offsetPoints[0].x} ${offsetPoints[0].y} L ${offsetPoints[1].x} ${offsetPoints[1].y}`;
    } else if (offsetPoints.length === 3) {
      return `M ${offsetPoints[0].x} ${offsetPoints[0].y} Q ${offsetPoints[1].x} ${offsetPoints[1].y} ${offsetPoints[2].x} ${offsetPoints[2].y}`;
    }

    // For more complex paths, use cubic bezier
    let path = `M ${offsetPoints[0].x} ${offsetPoints[0].y}`;
    for (let i = 1; i < offsetPoints.length - 1; i++) {
      const cp1 = offsetPoints[i];
      const cp2 = offsetPoints[i];
      const end = offsetPoints[i + 1];
      path += ` C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${end.x} ${end.y}`;
    }
    
    return path;
  };

  if (bundles.length === 0) return null;

  return (
    <g className="bundled-edges">
      <defs>
        <marker
          id="arrowhead-bundle"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
        </marker>
        <marker
          id="arrowhead-bundle-selected"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
        </marker>
      </defs>

      {bundles.map(bundleGroup => {
        const strokeColor = getBundleColor(bundleGroup);
        const strokeWidth = getBundleStrokeWidth(bundleGroup);
        const hasSelectedEdge = bundleGroup.edges.some(edge => edge.id === selectedEdgeId);
        const markerEnd = hasSelectedEdge ? "url(#arrowhead-bundle-selected)" : "url(#arrowhead-bundle)";

        return (
          <g key={bundleGroup.id} className="bundle-group">
            {/* Individual edge paths within bundle */}
            {bundleGroup.edges.map((edge, index) => {
              const edgePath = getIndividualEdgePath(bundleGroup, index);
              const isSelected = edge.id === selectedEdgeId;
              
              return (
                <g key={edge.id}>
                  {/* Invisible hit area */}
                  <path
                    d={edgePath}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="12"
                    style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                    onClick={(e) => handleBundleClick(e, bundleGroup)}
                  />
                  {/* Visible edge */}
                  <path
                    d={edgePath}
                    fill="none"
                    stroke={isSelected ? "#3b82f6" : strokeColor}
                    strokeWidth={isSelected ? "3" : "2"}
                    markerEnd={isSelected ? "url(#arrowhead-bundle-selected)" : markerEnd}
                    style={{ 
                      pointerEvents: 'none',
                      opacity: isSelected ? 1 : 0.8,
                      transition: 'all 0.2s ease-out'
                    }}
                    className={`bundled-edge ${isSelected ? 'selected' : ''}`}
                  />
                </g>
              );
            })}
            
            {/* Bundle count indicator for large bundles */}
            {bundleGroup.edges.length > 3 && (
              <circle
                cx={bundleGroup.controlPoints[0]?.x || 0}
                cy={bundleGroup.controlPoints[0]?.y || 0}
                r="8"
                fill={strokeColor}
                stroke="white"
                strokeWidth="2"
                style={{ pointerEvents: 'none' }}
              />
            )}
            {bundleGroup.edges.length > 3 && (
              <text
                x={bundleGroup.controlPoints[0]?.x || 0}
                y={bundleGroup.controlPoints[0]?.y || 0}
                textAnchor="middle"
                dy="0.3em"
                fontSize="10"
                fill="white"
                fontWeight="bold"
                style={{ pointerEvents: 'none' }}
              >
                {bundleGroup.edges.length}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
};

export default BundledEdgeRenderer;
