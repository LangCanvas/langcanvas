
import React from 'react';

interface EdgePreviewProps {
  edgePreview: { startX: number; startY: number; endX: number; endY: number; sourceNode: any } | null;
}

const EdgePreview: React.FC<EdgePreviewProps> = ({ edgePreview }) => {
  if (!edgePreview) return null;

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
          <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
        </marker>
      </defs>
      <line
        x1={edgePreview.startX}
        y1={edgePreview.startY}
        x2={edgePreview.endX}
        y2={edgePreview.endY}
        stroke="#6b7280"
        strokeWidth="2"
        strokeDasharray="5,5"
        markerEnd="url(#arrowhead-preview)"
      />
    </svg>
  );
};

export default EdgePreview;
