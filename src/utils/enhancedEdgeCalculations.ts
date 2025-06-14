import { EnhancedNode } from '../types/nodeTypes';
import { GridSystem } from './gridSystem';
import { AStarPathfinder } from './astarPathfinding';
import { PathfindingCache } from './pathfindingCache';
import { createQualityAwarePathfinder, PathQuality } from './pathQualityModes';
import { PathOptimizer } from './pathOptimization';
import { PathfindingUtils } from './pathfindingUtils';

export interface EnhancedPathResult {
  waypoints: Array<{ x: number, y: number }>;
  found: boolean;
  cost: number;
  debug?: {
    gridPath: Array<{ x: number, y: number }>;
    nodesExplored: number;
    cached: boolean;
    quality: PathQuality;
  };
}

export class EnhancedEdgeCalculator {
  private grid: GridSystem;
  private pathfinder: AStarPathfinder;
  private qualityPathfinder: any;
  private canvasWidth: number;
  private canvasHeight: number;
  private cache: PathfindingCache;
  private batchUpdateTimeout: NodeJS.Timeout | null = null;
  private pendingUpdates = new Set<string>();
  private currentQuality: PathQuality = 'balanced';

  constructor(canvasWidth: number = 3000, canvasHeight: number = 3000) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.grid = new GridSystem(canvasWidth, canvasHeight, 20);
    this.pathfinder = new AStarPathfinder(this.grid);
    this.qualityPathfinder = createQualityAwarePathfinder(this.pathfinder, this.grid);
    this.cache = new PathfindingCache();
  }

  public setPathQuality(quality: PathQuality): void {
    if (this.currentQuality !== quality) {
      this.currentQuality = quality;
      this.cache.invalidateGrid();
    }
  }

  public updateNodes(nodes: EnhancedNode[]): void {
    this.grid.updateNodes(nodes);
    this.cache.invalidateGrid();
  }

  public updateNodesBatch(nodes: EnhancedNode[]): void {
    if (this.batchUpdateTimeout) {
      clearTimeout(this.batchUpdateTimeout);
    }

    nodes.forEach(node => this.pendingUpdates.add(node.id));

    this.batchUpdateTimeout = setTimeout(() => {
      this.updateNodes(nodes);
      this.pendingUpdates.clear();
      this.batchUpdateTimeout = null;
    }, 50);
  }

  public invalidateNodePaths(nodeId: string): void {
    this.cache.invalidateNode(nodeId);
  }

  public getConnectionPoints(sourceNode: EnhancedNode, targetNode: EnhancedNode) {
    return PathfindingUtils.getConnectionPoints(sourceNode, targetNode);
  }

  public calculatePath(sourceNode: EnhancedNode, targetNode: EnhancedNode): EnhancedPathResult {
    const cacheKey = `${sourceNode.id}-${targetNode.id}-${this.currentQuality}`;
    const cachedResult = this.cache.get(sourceNode.id, targetNode.id);
    if (cachedResult && cachedResult.debug?.quality === this.currentQuality) {
      return {
        ...cachedResult,
        debug: {
          ...cachedResult.debug,
          cached: true
        }
      };
    }

    const { start, end } = this.getConnectionPoints(sourceNode, targetNode);
    
    const gridStart = this.grid.canvasToGrid(start.x, start.y);
    const gridEnd = this.grid.canvasToGrid(end.x, end.y);
    
    const clearStart = PathfindingUtils.findClearPoint(gridStart, gridEnd, sourceNode, this.grid);
    const clearEnd = PathfindingUtils.findClearPoint(gridEnd, gridStart, targetNode, this.grid);
    
    const pathResult = this.qualityPathfinder.findPath(clearStart, clearEnd, this.currentQuality);
    
    if (!pathResult.found) {
      return {
        waypoints: [start, end],
        found: false,
        cost: Infinity,
        debug: {
          gridPath: [],
          nodesExplored: pathResult.nodesExplored,
          cached: false,
          quality: this.currentQuality
        }
      };
    }
    
    const canvasWaypoints = pathResult.path.map(point => 
      this.grid.gridToCanvas(point.x, point.y)
    );
    
    const finalWaypoints = [start, ...canvasWaypoints, end];
    
    const result = {
      waypoints: PathOptimizer.optimizeWaypoints(finalWaypoints),
      found: true,
      cost: pathResult.cost,
      debug: {
        gridPath: pathResult.path,
        nodesExplored: pathResult.nodesExplored,
        cached: false,
        quality: this.currentQuality
      }
    };

    this.cache.set(sourceNode.id, targetNode.id, result);
    return result;
  }

  public getGridSystem(): GridSystem {
    return this.grid;
  }

  public getPathfinder(): AStarPathfinder {
    return this.pathfinder;
  }

  public getCacheStats() {
    return this.cache.getStats();
  }

  public clearCache(): void {
    this.cache.invalidateGrid();
  }
}

// Global instance for the application
let globalEdgeCalculator: EnhancedEdgeCalculator | null = null;

export const getEnhancedEdgeCalculator = (): EnhancedEdgeCalculator => {
  if (!globalEdgeCalculator) {
    globalEdgeCalculator = new EnhancedEdgeCalculator();
  }
  return globalEdgeCalculator;
};

export const updateEdgeCalculatorNodes = (nodes: EnhancedNode[]): void => {
  const calculator = getEnhancedEdgeCalculator();
  calculator.updateNodesBatch(nodes);
};

export const setPathfindingQuality = (quality: PathQuality): void => {
  const calculator = getEnhancedEdgeCalculator();
  calculator.setPathQuality(quality);
};

// Enhanced calculation functions that match the existing API
export const calculateEnhancedOrthogonalPath = (
  sourceNode: EnhancedNode, 
  targetNode: EnhancedNode
): { x: number, y: number }[] => {
  const calculator = getEnhancedEdgeCalculator();
  const result = calculator.calculatePath(sourceNode, targetNode);
  return result.waypoints;
};
