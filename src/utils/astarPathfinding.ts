
import { GridSystem } from './gridSystem';
import { PathfindingHeuristics } from './pathfindingHeuristics';
import { PathReconstructor } from './pathReconstruction';

export interface PathNode {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
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
      h: PathfindingHeuristics.octileDistance(start, goal),
      f: 0,
      parent: null
    };
    startNode.f = startNode.g + startNode.h;

    openSet.push(startNode);
    allNodes.set(this.getNodeKey(start.x, start.y), startNode);

    let nodesExplored = 0;

    while (openSet.length > 0) {
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

      if (current.x === goal.x && current.y === goal.y) {
        return {
          path: PathReconstructor.reconstructPath(current),
          found: true,
          cost: current.g,
          nodesExplored
        };
      }

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
            h: PathfindingHeuristics.octileDistance(neighbor, goal),
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
      result.path = PathReconstructor.smoothPath(result.path, this.grid);
    }
    
    return result;
  }
}
