import { EnhancedNode } from '../types/nodeTypes';
import { GridSystem } from './gridSystem';
import { AStarPathfinder, PathfindingResult } from './astarPathfinding';
import { getNodeDimensions } from './edgeCalculations';

export interface EnhancedPathResult {
  waypoints: Array<{ x: number, y: number }>;
  found: boolean;
  cost: number;
  debug?: {
    gridPath: Array<{ x: number, y: number }>;
    nodesExplored: number;
  };
}

export class EnhancedEdgeCalculator {
  private grid: GridSystem;
  private pathfinder: AStarPathfinder;
  private canvasWidth: number;
  private canvasHeight: number;

  constructor(canvasWidth: number = 3000, canvasHeight: number = 3000) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.grid = new GridSystem(canvasWidth, canvasHeight, 20);
    this.pathfinder = new AStarPathfinder(this.grid);
  }

  public updateNodes(nodes: EnhancedNode[]): void {
    this.grid.updateNodes(nodes);
  }

  public getConnectionPoints(sourceNode: EnhancedNode, targetNode: EnhancedNode) {
    const sourceDim = getNodeDimensions(sourceNode.type);
    const targetDim = getNodeDimensions(targetNode.type);
    
    // Always use right handle for source and left handle for target
    const start = {
      x: sourceNode.x + sourceDim.width,
      y: sourceNode.y + sourceDim.height / 2
    };
    
    const end = {
      x: targetNode.x,
      y: targetNode.y + targetDim.height / 2
    };
    
    return { start, end };
  }

  public calculatePath(sourceNode: EnhancedNode, targetNode: EnhancedNode): EnhancedPathResult {
    const { start, end } = this.getConnectionPoints(sourceNode, targetNode);
    
    // Convert canvas coordinates to grid coordinates
    const gridStart = this.grid.canvasToGrid(start.x, start.y);
    const gridEnd = this.grid.canvasToGrid(end.x, end.y);
    
    // Find a clear starting point (move away from source node)
    const clearStart = this.findClearPoint(gridStart, gridEnd, sourceNode);
    const clearEnd = this.findClearPoint(gridEnd, gridStart, targetNode);
    
    // Use A* to find the path
    const pathResult = this.pathfinder.findPathWithSmoothing(clearStart, clearEnd);
    
    if (!pathResult.found) {
      // Fallback to direct line if no path found
      return {
        waypoints: [start, end],
        found: false,
        cost: Infinity,
        debug: {
          gridPath: [],
          nodesExplored: pathResult.nodesExplored
        }
      };
    }
    
    // Convert grid path back to canvas coordinates
    const canvasWaypoints = pathResult.path.map(point => 
      this.grid.gridToCanvas(point.x, point.y)
    );
    
    // Add the actual start and end points
    const finalWaypoints = [start, ...canvasWaypoints, end];
    
    return {
      waypoints: this.optimizeWaypoints(finalWaypoints),
      found: true,
      cost: pathResult.cost,
      debug: {
        gridPath: pathResult.path,
        nodesExplored: pathResult.nodesExplored
      }
    };
  }

  private findClearPoint(
    point: { x: number, y: number }, 
    target: { x: number, y: number },
    avoidNode: EnhancedNode
  ): { x: number, y: number } {
    // If the point is already clear, use it
    if (!this.grid.isObstacle(point.x, point.y)) {
      return point;
    }
    
    // Try to find a clear point around the node
    const directions = [
      { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
      { dx: 1, dy: 1 }, { dx: -1, dy: -1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }
    ];
    
    for (let distance = 1; distance <= 5; distance++) {
      for (const dir of directions) {
        const testPoint = {
          x: point.x + dir.dx * distance,
          y: point.y + dir.dy * distance
        };
        
        if (this.grid.isValidPosition(testPoint.x, testPoint.y) && 
            !this.grid.isObstacle(testPoint.x, testPoint.y)) {
          return testPoint;
        }
      }
    }
    
    // If no clear point found, return the original point
    return point;
  }

  private optimizeWaypoints(waypoints: Array<{ x: number, y: number }>): Array<{ x: number, y: number }> {
    if (waypoints.length <= 2) return waypoints;
    
    const optimized = [waypoints[0]];
    
    for (let i = 1; i < waypoints.length - 1; i++) {
      const prev = waypoints[i - 1];
      const current = waypoints[i];
      const next = waypoints[i + 1];
      
      // Check if this waypoint is necessary (not collinear)
      const dx1 = current.x - prev.x;
      const dy1 = current.y - prev.y;
      const dx2 = next.x - current.x;
      const dy2 = next.y - current.y;
      
      // Cross product to check if points are collinear
      const cross = dx1 * dy2 - dy1 * dx2;
      
      // If not collinear (with small tolerance), keep the waypoint
      if (Math.abs(cross) > 0.1) {
        optimized.push(current);
      }
    }
    
    optimized.push(waypoints[waypoints.length - 1]);
    return optimized;
  }

  public getGridSystem(): GridSystem {
    return this.grid;
  }

  public getPathfinder(): AStarPathfinder {
    return this.pathfinder;
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
  calculator.updateNodes(nodes);
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
