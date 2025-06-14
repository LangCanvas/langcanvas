
import { EnhancedNode } from '../types/nodeTypes';
import { AStarPathfinder, PathfindingResult } from './astarPathfinding';
import { GridSystem } from './gridSystem';

export type PathQuality = 'fast' | 'balanced' | 'smooth';

export interface QualityConfig {
  smoothingPasses: number;
  optimizationLevel: number;
  heuristicWeight: number;
  allowDiagonal: boolean;
  usePostProcessing: boolean;
}

const QUALITY_CONFIGS: Record<PathQuality, QualityConfig> = {
  fast: {
    smoothingPasses: 0,
    optimizationLevel: 1,
    heuristicWeight: 1.2, // Slightly greedy for faster computation
    allowDiagonal: true,
    usePostProcessing: false
  },
  balanced: {
    smoothingPasses: 1,
    optimizationLevel: 2,
    heuristicWeight: 1.0, // Standard A*
    allowDiagonal: true,
    usePostProcessing: true
  },
  smooth: {
    smoothingPasses: 3,
    optimizationLevel: 3,
    heuristicWeight: 0.9, // Less greedy for better paths
    allowDiagonal: true,
    usePostProcessing: true
  }
};

export class QualityAwarePathfinder {
  private pathfinder: AStarPathfinder;
  private grid: GridSystem;

  constructor(pathfinder: AStarPathfinder, grid: GridSystem) {
    this.pathfinder = pathfinder;
    this.grid = grid;
  }

  public findPath(
    start: { x: number, y: number },
    goal: { x: number, y: number },
    quality: PathQuality = 'balanced'
  ): PathfindingResult {
    const config = QUALITY_CONFIGS[quality];
    
    // Use different pathfinding strategies based on quality
    switch (quality) {
      case 'fast':
        return this.findFastPath(start, goal, config);
      case 'smooth':
        return this.findSmoothPath(start, goal, config);
      default:
        return this.pathfinder.findPathWithSmoothing(start, goal);
    }
  }

  private findFastPath(
    start: { x: number, y: number },
    goal: { x: number, y: number },
    config: QualityConfig
  ): PathfindingResult {
    // Basic A* without post-processing for speed
    return this.pathfinder.findPath(start, goal);
  }

  private findSmoothPath(
    start: { x: number, y: number },
    goal: { x: number, y: number },
    config: QualityConfig
  ): PathfindingResult {
    // Enhanced pathfinding with multiple smoothing passes
    let result = this.pathfinder.findPathWithSmoothing(start, goal);
    
    if (result.found && config.usePostProcessing) {
      // Apply additional smoothing passes
      for (let i = 0; i < config.smoothingPasses; i++) {
        result.path = this.applyCurveSmoothing(result.path);
      }
      
      // Apply corner optimization
      result.path = this.optimizeCorners(result.path);
    }
    
    return result;
  }

  private applyCurveSmoothing(path: Array<{ x: number, y: number }>): Array<{ x: number, y: number }> {
    if (path.length <= 2) return path;
    
    const smoothed = [path[0]];
    
    for (let i = 1; i < path.length - 1; i++) {
      const prev = path[i - 1];
      const current = path[i];
      const next = path[i + 1];
      
      // Apply simple moving average smoothing
      const smoothedPoint = {
        x: (prev.x + current.x * 2 + next.x) / 4,
        y: (prev.y + current.y * 2 + next.y) / 4
      };
      
      // Ensure the smoothed point is still valid
      if (!this.grid.isObstacle(Math.round(smoothedPoint.x), Math.round(smoothedPoint.y))) {
        smoothed.push(smoothedPoint);
      } else {
        smoothed.push(current);
      }
    }
    
    smoothed.push(path[path.length - 1]);
    return smoothed;
  }

  private optimizeCorners(path: Array<{ x: number, y: number }>): Array<{ x: number, y: number }> {
    if (path.length <= 2) return path;
    
    const optimized = [path[0]];
    
    for (let i = 1; i < path.length - 1; i++) {
      const prev = optimized[optimized.length - 1];
      const current = path[i];
      const next = path[i + 1];
      
      // Check if we can skip this waypoint (corner cutting)
      if (this.hasLineOfSight(prev, next)) {
        continue; // Skip the current waypoint
      }
      
      optimized.push(current);
    }
    
    optimized.push(path[path.length - 1]);
    return optimized;
  }

  private hasLineOfSight(start: { x: number, y: number }, end: { x: number, y: number }): boolean {
    const dx = Math.abs(end.x - start.x);
    const dy = Math.abs(end.y - start.y);
    const x1 = start.x;
    const y1 = start.y;
    const x2 = end.x;
    const y2 = end.y;

    let x = x1;
    let y = y1;
    const n = 1 + dx + dy;
    const x_inc = (x2 > x1) ? 1 : -1;
    const y_inc = (y2 > y1) ? 1 : -1;
    let error = dx - dy;

    for (let i = 0; i < n; i++) {
      if (this.grid.isObstacle(Math.round(x), Math.round(y))) {
        return false;
      }

      if (error > 0) {
        x += x_inc;
        error -= dy * 2;
      } else {
        y += y_inc;
        error += dx * 2;
      }
    }

    return true;
  }
}

export const createQualityAwarePathfinder = (pathfinder: AStarPathfinder, grid: GridSystem): QualityAwarePathfinder => {
  return new QualityAwarePathfinder(pathfinder, grid);
};
