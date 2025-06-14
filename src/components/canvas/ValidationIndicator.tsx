
import React from 'react';
import { AlertTriangle, XCircle, CheckCircle } from 'lucide-react';

interface ValidationIndicatorProps {
  x: number;
  y: number;
  type: 'error' | 'warning' | 'success';
  message: string;
  size?: number;
}

const ValidationIndicator: React.FC<ValidationIndicatorProps> = ({
  x,
  y,
  type,
  message,
  size = 20
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <XCircle className="w-full h-full" />;
      case 'warning':
        return <AlertTriangle className="w-full h-full" />;
      case 'success':
        return <CheckCircle className="w-full h-full" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'success':
        return '#10b981';
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'error':
        return '#fef2f2';
      case 'warning':
        return '#fffbeb';
      case 'success':
        return '#f0fdf4';
    }
  };

  return (
    <g className="validation-indicator">
      {/* Background circle */}
      <circle
        cx={x}
        cy={y}
        r={size / 2 + 2}
        fill={getBgColor()}
        stroke={getColor()}
        strokeWidth={1}
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))' }}
      />
      
      {/* Icon */}
      <foreignObject
        x={x - size / 2}
        y={y - size / 2}
        width={size}
        height={size}
        style={{ pointerEvents: 'none' }}
      >
        <div 
          style={{ 
            color: getColor(),
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {getIcon()}
        </div>
      </foreignObject>

      {/* Tooltip */}
      <title>{message}</title>
    </g>
  );
};

export default ValidationIndicator;
