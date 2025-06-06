
import React from 'react';
import { calculateOrthogonalPath } from '../../utils/edgeCalculations';

interface EdgePreviewProps {
  edgePreview: { 
    startX: number; 
    startY: number; 
    endX: number; 
    endY: number;
    targetNode?: any;
  } | null;
}

const EdgePreview: React.FC<EdgePreviewProps> = ({ edgePreview }) => {
  if (!edgePreview) return null;

  const isConnectingToNode = !!edgePreview.targetNode;
  
  // Create a path for the preview
  let pathString: string;
  
  if (isConnectingToNode && edgePreview.targetNode) {
    // Use orthogonal routing when connecting to a node
    const waypoints = calculateOrthogonalPath(
      // Create temporary source node for calculation
      { 
        id: 'temp-source', 
        x: edgePreview.startX - 60, 
        y: edgePreview.startY - 30, 
        type: 'agent' 
      } as any,
      edgePreview.targetNode
    );
    pathString = waypoints.map(point => `${point.x},${point.y}`).join(' ');
  } else {
    // Straight line when dragging freely
    pathString = `${edgePreview.startX},${edgePreview.startY} ${edgePreview.endX},${edgePreview.endY}`;
  }

  return (
    <svg className="absolute inset-0 pointer-events-none z-10" style={{ width: '100%', height: '100%' }}>
      <defs>
        <marker
          id="arrowhead-preview"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon 
            points="0 0, 10 3.5, 0 7" 
            fill={isConnectingToNode ? "#10b981" : "#6b7280"} 
          />
        </marker>
      </defs>
      <polyline
        points={pathString}
        fill="none"
        stroke={isConnectingToNode ? "#10b981" : "#6b7280"}
        strokeWidth="3"
        strokeLinejoin="round"
        strokeDasharray={isConnectingToNode ? "none" : "8,4"}
        markerEnd="url(#arrowhead-preview)"
        opacity={isConnectingToNode ? "0.8" : "0.6"}
      />
    </svg>
  );
};

export default EdgePreview;
