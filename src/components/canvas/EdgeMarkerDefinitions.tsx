
import React from 'react';
import EnhancedLoopMarkers from './EnhancedLoopMarkers';

const EdgeMarkerDefinitions: React.FC = () => {
  return (
    <defs>
      {/* Enhanced gradient definitions for better visual appeal */}
      <linearGradient id="edge-gradient-success" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
      </linearGradient>
      
      <linearGradient id="edge-gradient-selected" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#3b82f6" stopOpacity="1" />
      </linearGradient>

      {/* Enhanced arrowhead markers with better styling */}
      <marker
        id="arrowhead-enhanced"
        markerWidth="12"
        markerHeight="8"
        refX="11"
        refY="4"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path 
          d="M0,0 L0,8 L12,4 z" 
          fill="#10b981" 
          stroke="#10b981"
          strokeWidth="0.5"
          style={{ 
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
          }}
        />
      </marker>
      
      <marker
        id="arrowhead-enhanced-selected"
        markerWidth="12"
        markerHeight="8"
        refX="11"
        refY="4"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path 
          d="M0,0 L0,8 L12,4 z" 
          fill="#3b82f6" 
          stroke="#3b82f6"
          strokeWidth="0.5"
          style={{ 
            filter: 'drop-shadow(0 1px 3px rgba(59,130,246,0.2))'
          }}
        />
      </marker>
      
      <marker
        id="arrowhead-enhanced-error"
        markerWidth="12"
        markerHeight="8"
        refX="11"
        refY="4"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path 
          d="M0,0 L0,8 L12,4 z" 
          fill="#ef4444" 
          stroke="#ef4444"
          strokeWidth="0.5"
          style={{ 
            filter: 'drop-shadow(0 1px 3px rgba(239,68,68,0.2))'
          }}
        />
      </marker>
      
      <marker
        id="arrowhead-enhanced-warning"
        markerWidth="12"
        markerHeight="8"
        refX="11"
        refY="4"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path 
          d="M0,0 L0,8 L12,4 z" 
          fill="#f59e0b" 
          stroke="#f59e0b"
          strokeWidth="0.5"
          style={{ 
            filter: 'drop-shadow(0 1px 3px rgba(245,158,11,0.2))'
          }}
        />
      </marker>

      {/* Enhanced conditional edge markers */}
      <marker
        id="arrowhead-conditional-true"
        markerWidth="12"
        markerHeight="8"
        refX="11"
        refY="4"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path 
          d="M0,0 L0,8 L12,4 z" 
          fill="#22c55e" 
          stroke="#22c55e"
          strokeWidth="0.5"
          style={{ 
            filter: 'drop-shadow(0 1px 2px rgba(34,197,94,0.2))'
          }}
        />
      </marker>
      
      <marker
        id="arrowhead-conditional-false"
        markerWidth="12"
        markerHeight="8"
        refX="11"
        refY="4"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path 
          d="M0,0 L0,8 L12,4 z" 
          fill="#ef4444" 
          stroke="#ef4444"
          strokeWidth="0.5"
          style={{ 
            filter: 'drop-shadow(0 1px 2px rgba(239,68,68,0.2))'
          }}
        />
      </marker>

      {/* Include loop-specific markers */}
      <EnhancedLoopMarkers />
    </defs>
  );
};

export default EdgeMarkerDefinitions;
