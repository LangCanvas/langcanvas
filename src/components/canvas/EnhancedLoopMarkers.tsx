
import React from 'react';

const EnhancedLoopMarkers: React.FC = () => {
  return (
    <defs>
      {/* Loop-specific arrow markers */}
      <marker
        id="arrowhead-loop"
        markerWidth="14"
        markerHeight="10"
        refX="13"
        refY="5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path 
          d="M0,0 L0,10 L14,5 z" 
          fill="#8b5cf6" 
          stroke="#8b5cf6"
          strokeWidth="0.5"
          style={{ 
            filter: 'drop-shadow(0 1px 3px rgba(139,92,246,0.3))'
          }}
        />
      </marker>
      
      <marker
        id="arrowhead-loop-selected"
        markerWidth="14"
        markerHeight="10"
        refX="13"
        refY="5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path 
          d="M0,0 L0,10 L14,5 z" 
          fill="#3b82f6" 
          stroke="#3b82f6"
          strokeWidth="0.5"
          style={{ 
            filter: 'drop-shadow(0 1px 4px rgba(59,130,246,0.4))'
          }}
        />
      </marker>

      <marker
        id="arrowhead-loop-danger"
        markerWidth="14"
        markerHeight="10"
        refX="13"
        refY="5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path 
          d="M0,0 L0,10 L14,5 z" 
          fill="#dc2626" 
          stroke="#dc2626"
          strokeWidth="0.5"
          style={{ 
            filter: 'drop-shadow(0 1px 3px rgba(220,38,38,0.3))'
          }}
        />
      </marker>

      <marker
        id="arrowhead-loop-warning"
        markerWidth="14"
        markerHeight="10"
        refX="13"
        refY="5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path 
          d="M0,0 L0,10 L14,5 z" 
          fill="#d97706" 
          stroke="#d97706"
          strokeWidth="0.5"
          style={{ 
            filter: 'drop-shadow(0 1px 3px rgba(217,119,6,0.3))'
          }}
        />
      </marker>

      {/* Flow animation gradient */}
      <linearGradient id="loop-flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
        <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
      </linearGradient>
    </defs>
  );
};

export default EnhancedLoopMarkers;
