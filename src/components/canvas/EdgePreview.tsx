
import React from 'react';

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
      <line
        x1={edgePreview.startX}
        y1={edgePreview.startY}
        x2={edgePreview.endX}
        y2={edgePreview.endY}
        stroke={isConnectingToNode ? "#10b981" : "#6b7280"}
        strokeWidth="3"
        strokeDasharray={isConnectingToNode ? "none" : "8,4"}
        markerEnd="url(#arrowhead-preview)"
        opacity={isConnectingToNode ? "0.8" : "0.6"}
      />
    </svg>
  );
};

export default EdgePreview;
