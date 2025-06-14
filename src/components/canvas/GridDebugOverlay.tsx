
import React from 'react';
import { GridSystem } from '../../utils/gridSystem';

interface GridDebugOverlayProps {
  grid: GridSystem;
  visible: boolean;
  opacity?: number;
}

const GridDebugOverlay: React.FC<GridDebugOverlayProps> = ({ 
  grid, 
  visible, 
  opacity = 0.3 
}) => {
  if (!visible) return null;

  const config = grid.getConfig();
  const cells = [];

  // Generate grid cells
  for (let y = 0; y < Math.min(config.height, 150); y++) { // Limit for performance
    for (let x = 0; x < Math.min(config.width, 150); x++) {
      const isObstacle = grid.isObstacle(x, y);
      const cost = grid.getCost(x, y);
      
      let fillColor = 'transparent';
      if (isObstacle) {
        fillColor = '#ef4444'; // red for obstacles
      } else if (cost > 1) {
        fillColor = '#f97316'; // orange for high cost
      }

      cells.push(
        <rect
          key={`grid-${x}-${y}`}
          x={x * config.cellSize}
          y={y * config.cellSize}
          width={config.cellSize}
          height={config.cellSize}
          fill={fillColor}
          fillOpacity={opacity}
          stroke="rgba(100,100,100,0.1)"
          strokeWidth="0.5"
        />
      );
    }
  }

  return (
    <g className="grid-debug-overlay">
      {cells}
      {/* Grid info overlay */}
      <foreignObject x="10" y="10" width="200" height="100">
        <div className="bg-black bg-opacity-75 text-white p-2 rounded text-xs">
          <div>Grid: {config.width}×{config.height}</div>
          <div>Cell Size: {config.cellSize}px</div>
          <div>Total Cells: {config.width * config.height}</div>
        </div>
      </foreignObject>
    </g>
  );
};

export default GridDebugOverlay;
