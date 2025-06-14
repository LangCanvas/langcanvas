
import React from 'react';
import { BundleGroup } from '../../utils/edgeBundling';
import { EnhancedNode } from '../../types/nodeTypes';
import BundleVisualization from './BundleVisualization';
import BundleIndicator from './BundleIndicator';

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
          <g key={bundleGroup.id}>
            <BundleVisualization
              bundleGroup={bundleGroup}
              strokeColor={strokeColor}
              strokeWidth={strokeWidth}
              markerEnd={markerEnd}
              onBundleClick={handleBundleClick}
            />
            <BundleIndicator
              bundleGroup={bundleGroup}
              strokeColor={strokeColor}
            />
          </g>
        );
      })}
    </g>
  );
};

export default BundledEdgeRenderer;
