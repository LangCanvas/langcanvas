
import { useEffect, useCallback } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { getEnhancedEdgeCalculator } from '../utils/enhancedEdgeCalculations';
import { useEnhancedAnalytics } from './useEnhancedAnalytics';

export const useAStarPathfinding = (nodes: EnhancedNode[]) => {
  const analytics = useEnhancedAnalytics();

  // Update the pathfinding system when nodes change
  useEffect(() => {
    const calculator = getEnhancedEdgeCalculator();
    calculator.updateNodes(nodes);
    
    if (analytics.isEnabled) {
      analytics.trackFeatureUsage('astar_grid_updated', {
        nodeCount: nodes.length,
        timestamp: Date.now()
      });
    }
  }, [nodes, analytics]);

  const getPathfindingStats = useCallback(() => {
    const calculator = getEnhancedEdgeCalculator();
    const grid = calculator.getGridSystem();
    const config = grid.getConfig();
    
    return {
      gridSize: `${config.width}x${config.height}`,
      cellSize: config.cellSize,
      totalCells: config.width * config.height,
      nodeCount: nodes.length
    };
  }, [nodes]);

  const calculatePath = useCallback((sourceNode: EnhancedNode, targetNode: EnhancedNode) => {
    const calculator = getEnhancedEdgeCalculator();
    const result = calculator.calculatePath(sourceNode, targetNode);
    
    if (analytics.isEnabled) {
      analytics.trackFeatureUsage('astar_path_calculated', {
        pathFound: result.found,
        pathCost: result.cost,
        waypointCount: result.waypoints.length,
        nodesExplored: result.debug?.nodesExplored || 0,
        sourceNodeType: sourceNode.type,
        targetNodeType: targetNode.type
      });
    }
    
    return result;
  }, [analytics]);

  return {
    getPathfindingStats,
    calculatePath
  };
};
