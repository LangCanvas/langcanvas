
import React from 'react';
import { DataFlowParticle } from '../../hooks/useEdgeAnimations';

interface DataFlowAnimationsProps {
  particles: DataFlowParticle[];
  pathPoints: Array<{ x: number; y: number }>;
  color?: string;
  size?: number;
}

const DataFlowAnimations: React.FC<DataFlowAnimationsProps> = ({
  particles,
  pathPoints,
  color = "#3b82f6",
  size = 4
}) => {
  const getParticlePosition = (position: number): { x: number; y: number } => {
    if (pathPoints.length < 2) return { x: 0, y: 0 };
    
    const totalLength = pathPoints.length - 1;
    const segmentIndex = Math.floor(position * totalLength);
    const segmentProgress = (position * totalLength) % 1;
    
    const startPoint = pathPoints[segmentIndex] || pathPoints[0];
    const endPoint = pathPoints[segmentIndex + 1] || pathPoints[pathPoints.length - 1];
    
    return {
      x: startPoint.x + (endPoint.x - startPoint.x) * segmentProgress,
      y: startPoint.y + (endPoint.y - startPoint.y) * segmentProgress
    };
  };

  if (particles.length === 0 || pathPoints.length < 2) return null;

  return (
    <g className="data-flow-particles">
      {particles.map(particle => {
        const position = getParticlePosition(particle.position);
        return (
          <circle
            key={particle.id}
            cx={position.x}
            cy={position.y}
            r={size}
            fill={color}
            opacity={0.8}
            style={{
              filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.6))',
              animation: 'pulse 1s ease-in-out infinite alternate'
            }}
          />
        );
      })}
    </g>
  );
};

export default DataFlowAnimations;
