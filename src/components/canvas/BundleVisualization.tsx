
import React from 'react';
import { BundleGroup } from '../../utils/edgeBundling';

interface BundleVisualizationProps {
  bundleGroup: BundleGroup;
  strokeColor: string;
  strokeWidth: number;
  markerEnd: string;
  onBundleClick: (e: React.MouseEvent, bundleGroup: BundleGroup) => void;
}

const BundleVisualization: React.FC<BundleVisualizationProps> = ({
  bundleGroup,
  strokeColor,
  strokeWidth,
  markerEnd,
  onBundleClick
}) => {
  const getIndividualEdgePath = (edgeIndex: number): string => {
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

  return (
    <g className="bundle-group">
      {bundleGroup.edges.map((edge, index) => {
        const edgePath = getIndividualEdgePath(index);
        const isSelected = false; // This will be passed from parent
        
        return (
          <g key={edge.id}>
            {/* Invisible hit area */}
            <path
              d={edgePath}
              fill="none"
              stroke="transparent"
              strokeWidth="12"
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
              onClick={(e) => onBundleClick(e, bundleGroup)}
            />
            {/* Visible edge */}
            <path
              d={edgePath}
              fill="none"
              stroke={isSelected ? "#3b82f6" : strokeColor}
              strokeWidth={isSelected ? "3" : "2"}
              markerEnd={markerEnd}
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
    </g>
  );
};

export default BundleVisualization;
