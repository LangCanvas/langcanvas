
import { GridSystem } from './gridSystem';

export interface PathNode {
  x: number;
  y: number;
  g: number; // Cost from start
  h: number; // Heuristic cost to goal
  f: number; // Total cost (g + h)
  parent: PathNode | null;
}

export interface PathfindingResult {
  path: Array<{ x: number, y: number }>;
  found: boolean;
  cost: number;
  nodesExplored: number;
}

export class AStarPathfinder {
  private grid: GridSystem;

  constructor(grid: GridSystem) {
    this.grid = grid;
  }

  private manhattanDistance(a: { x: number, y: number }, b: { x: number, y: number }): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  private euclideanDistance(a: { x: number, y: number }, b: { x: number, y: number }): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private getHeuristic(current: { x: number, y: number }, goal: { x: number, y: number }): number {
    // Use octile distance for 8-directional movement
    const dx = Math.abs(current.x - goal.x);
    const dy = Math.abs(current.y - goal.y);
    return Math.max(dx, dy) + (Math.sqrt(2) - 1) * Math.min(dx, dy);
  }

  private reconstructPath(node: PathNode): Array<{ x: number, y: number }> {
    const path = [];
    let current = node;
    
    while (current) {
      path.unshift({ x: current.x, y: current.y });
      current = current.parent;
    }
    
    return path;
  }

  private getNodeKey(x: number, y: number): string {
    return `${x},${y}`;
  }

  public findPath(
    start: { x: number, y: number },
    goal: { x: number, y: number }
  ): PathfindingResult {
    const openSet: PathNode[] = [];
    const closedSet = new Set<string>();
    const allNodes = new Map<string, PathNode>();

    const startNode: PathNode = {
      x: start.x,
      y: start.y,
      g: 0,
      h: this.getHeuristic(start, goal),
      f: 0,
      parent: null
    };
    startNode.f = startNode.g + startNode.h;

    openSet.push(startNode);
    allNodes.set(this.getNodeKey(start.x, start.y), startNode);

    let nodesExplored = 0;

    while (openSet.length > 0) {
      // Find node with lowest f score
      let currentIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[currentIndex].f) {
          currentIndex = i;
        }
      }

      const current = openSet.splice(currentIndex, 1)[0];
      const currentKey = this.getNodeKey(current.x, current.y);
      closedSet.add(currentKey);
      nodesExplored++;

      // Check if we reached the goal
      if (current.x === goal.x && current.y === goal.y) {
        return {
          path: this.reconstructPath(current),
          found: true,
          cost: current.g,
          nodesExplored
        };
      }

      // Explore neighbors
      const neighbors = this.grid.getNeighbors(current.x, current.y);
      
      for (const neighbor of neighbors) {
        const neighborKey = this.getNodeKey(neighbor.x, neighbor.y);
        
        if (closedSet.has(neighborKey)) {
          continue;
        }

        const tentativeG = current.g + neighbor.cost;
        let neighborNode = allNodes.get(neighborKey);

        if (!neighborNode) {
          neighborNode = {
            x: neighbor.x,
            y: neighbor.y,
            g: Infinity,
            h: this.getHeuristic(neighbor, goal),
            f: 0,
            parent: null
          };
          allNodes.set(neighborKey, neighborNode);
        }

        if (tentativeG < neighborNode.g) {
          neighborNode.parent = current;
          neighborNode.g = tentativeG;
          neighborNode.f = neighborNode.g + neighborNode.h;

          if (!openSet.includes(neighborNode)) {
            openSet.push(neighborNode);
          }
        }
      }
    }

    // No path found
    return {
      path: [],
      found: false,
      cost: Infinity,
      nodesExplored
    };
  }

  public findPathWithSmoothing(
    start: { x: number, y: number },
    goal: { x: number, y: number }
  ): PathfindingResult {
    const result = this.findPath(start, goal);
    
    if (result.found && result.path.length > 2) {
      result.path = this.smoothPath(result.path);
    }
    
    return result;
  }

  private smoothPath(path: Array<{ x: number, y: number }>): Array<{ x: number, y: number }> {
    if (path.length <= 2) return path;

    const smoothed = [path[0]];
    let current = 0;

    while (current < path.length - 1) {
      let furthest = current + 1;
      
      // Find the furthest point we can reach in a straight line
      for (let i = current + 2; i < path.length; i++) {
        if (this.hasLineOfSight(path[current], path[i])) {
          furthest = i;
        } else {
          break;
        }
      }
      
      smoothed.push(path[furthest]);
      current = furthest;
    }

    return smoothed;
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

    dx *= 2;
    dy *= 2;

    for (let i = 0; i < n; i++) {
      if (this.grid.isObstacle(x, y)) {
        return false;
      }

      if (error > 0) {
        x += x_inc;
        error -= dy;
      } else {
        y += y_inc;
        error += dx;
      }
    }

    return true;
  }
}
