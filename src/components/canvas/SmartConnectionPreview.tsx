
import React from 'react';
import { EnhancedNode } from '../../types/nodeTypes';

interface SmartConnectionPreviewProps {
  sourceNode: EnhancedNode | null;
  targetNode: EnhancedNode | null;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isValid: boolean;
  errorMessage?: string;
}

const SmartConnectionPreview: React.FC<SmartConnectionPreviewProps> = ({
  sourceNode,
  targetNode,
  startX,
  startY,
  endX,
  endY,
  isValid,
  errorMessage
}) => {
  if (!sourceNode) return null;

  const strokeColor = isValid ? "#10b981" : "#ef4444";
  const strokeWidth = isValid ? 2 : 3;
  const strokeDasharray = isValid ? "none" : "8,4";

  return (
    <g className="smart-connection-preview">
      <defs>
        <marker
          id="arrowhead-preview-valid"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
        </marker>
        <marker
          id="arrowhead-preview-invalid"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
        </marker>
      </defs>

      {/* Connection line */}
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        markerEnd={isValid ? "url(#arrowhead-preview-valid)" : "url(#arrowhead-preview-invalid)"}
        style={{
          filter: isValid 
            ? 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.3))' 
            : 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.3))'
        }}
      />

      {/* Error message tooltip */}
      {!isValid && errorMessage && targetNode && (
        <g>
          <rect
            x={endX + 10}
            y={endY - 15}
            width={errorMessage.length * 6 + 20}
            height={30}
            fill="#fef2f2"
            stroke="#ef4444"
            strokeWidth={1}
            rx={4}
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }}
          />
          <text
            x={endX + 20}
            y={endY}
            fill="#dc2626"
            fontSize="12"
            fontWeight="500"
            textAnchor="start"
          >
            {errorMessage}
          </text>
        </g>
      )}

      {/* Visual feedback for target node */}
      {targetNode && (
        <circle
          cx={endX}
          cy={endY}
          r={8}
          fill="none"
          stroke={strokeColor}
          strokeWidth={2}
          strokeDasharray="4,2"
          style={{
            animation: 'pulse 1s infinite',
            opacity: 0.7
          }}
        />
      )}
    </g>
  );
};

export default SmartConnectionPreview;
