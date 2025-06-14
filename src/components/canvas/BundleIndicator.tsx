
import React from 'react';
import { BundleGroup } from '../../utils/edgeBundling';

interface BundleIndicatorProps {
  bundleGroup: BundleGroup;
  strokeColor: string;
}

const BundleIndicator: React.FC<BundleIndicatorProps> = ({
  bundleGroup,
  strokeColor
}) => {
  if (bundleGroup.edges.length <= 3) return null;

  return (
    <g className="bundle-indicator">
      <circle
        cx={bundleGroup.controlPoints[0]?.x || 0}
        cy={bundleGroup.controlPoints[0]?.y || 0}
        r="8"
        fill={strokeColor}
        stroke="white"
        strokeWidth="2"
        style={{ pointerEvents: 'none' }}
      />
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
    </g>
  );
};

export default BundleIndicator;
