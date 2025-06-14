
import { useEffect, useCallback } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { getEnhancedEdgeCalculator } from '../utils/enhancedEdgeCalculations';
import { useEnhancedAnalytics } from './useEnhancedAnalytics';
import { usePathfindingSettings } from './usePathfindingSettings';

export const useAStarPathfinding = (nodes: EnhancedNode[]) => {
  const analytics = useEnhancedAnalytics();
  const { settings } = usePathfindingSettings();

  // Update the pathfinding system when nodes change
  useEffect(() => {
    const calculator = getEnhancedEdgeCalculator();
    const startTime = performance.now();
    
    calculator.updateNodesBatch(nodes);
    
    const endTime = performance.now();
    const updateTime = endTime - startTime;
    
    if (analytics.isEnabled) {
      analytics.trackFeatureUsage('astar_grid_updated', {
        nodeCount: nodes.length,
        updateTime,
        timestamp: Date.now()
      });
    }
  }, [nodes, analytics]);

  const getPathfindingStats = useCallback(() => {
    const calculator = getEnhancedEdgeCalculator();
    const grid = calculator.getGridSystem();
    const config = grid.getConfig();
    const cacheStats = calculator.getCacheStats();
    
    return {
      gridSize: `${config.width}x${config.height}`,
      cellSize: config.cellSize,
      totalCells: config.width * config.height,
      nodeCount: nodes.length,
      cacheSize: cacheStats.size,
      cacheVersion: cacheStats.version
    };
  }, [nodes]);

  const calculatePath = useCallback((sourceNode: EnhancedNode, targetNode: EnhancedNode) => {
    const calculator = getEnhancedEdgeCalculator();
    const startTime = performance.now();
    
    const result = calculator.calculatePath(sourceNode, targetNode);
    
    const endTime = performance.now();
    const calculationTime = endTime - startTime;
    
    if (analytics.isEnabled) {
      analytics.trackFeatureUsage('astar_path_calculated', {
        pathFound: result.found,
        pathCost: result.cost,
        waypointCount: result.waypoints.length,
        nodesExplored: result.debug?.nodesExplored || 0,
        cached: result.debug?.cached || false,
        calculationTime,
        sourceNodeType: sourceNode.type,
        targetNodeType: targetNode.type
      });
    }
    
    return result;
  }, [analytics]);

  const clearCache = useCallback(() => {
    const calculator = getEnhancedEdgeCalculator();
    calculator.clearCache();
    
    if (analytics.isEnabled) {
      analytics.trackFeatureUsage('astar_cache_cleared', {
        timestamp: Date.now()
      });
    }
  }, [analytics]);

  return {
    getPathfindingStats,
    calculatePath,
    clearCache,
    settings
  };
};
