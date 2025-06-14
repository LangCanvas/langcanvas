
import React from 'react';
import { EnhancedEdge } from '../../types/edgeTypes';
import { EnhancedNode } from '../../types/nodeTypes';
import EdgeMarkerDefinitions from './EdgeMarkerDefinitions';
import GridDebugOverlay from './GridDebugOverlay';
import { getEnhancedEdgeCalculator } from '../../utils/enhancedEdgeCalculations';

interface EdgeRenderingManagerProps {
  edges: EnhancedEdge[];
  nodes: EnhancedNode[];
  enableDebugGrid: boolean;
  children: React.ReactNode;
}

const EdgeRenderingManager: React.FC<EdgeRenderingManagerProps> = ({
  edges,
  nodes,
  enableDebugGrid,
  children
}) => {
  if (edges.length === 0 && !enableDebugGrid) return null;

  return (
    <svg 
      className="absolute inset-0 z-10" 
      style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <EdgeMarkerDefinitions />
      
      {enableDebugGrid && (
        <GridDebugOverlay 
          grid={getEnhancedEdgeCalculator().getGridSystem()} 
          visible={enableDebugGrid}
          opacity={0.2}
        />
      )}
      
      {children}
    </svg>
  );
};

export default EdgeRenderingManager;
