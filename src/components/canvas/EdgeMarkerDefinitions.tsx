
import React from 'react';

const EdgeMarkerDefinitions: React.FC = () => {
  return (
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
  );
};

export default EdgeMarkerDefinitions;
