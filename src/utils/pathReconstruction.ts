
import { PathNode } from './astarPathfinding';

export class PathReconstructor {
  public static reconstructPath(node: PathNode): Array<{ x: number, y: number }> {
    const path = [];
    let current = node;
    
    while (current) {
      path.unshift({ x: current.x, y: current.y });
      current = current.parent;
    }
    
    return path;
  }

  public static smoothPath(path: Array<{ x: number, y: number }>, grid: any): Array<{ x: number, y: number }> {
    if (path.length <= 2) return path;

    const smoothed = [path[0]];
    let current = 0;

    while (current < path.length - 1) {
      let furthest = current + 1;
      
      for (let i = current + 2; i < path.length; i++) {
        if (PathReconstructor.hasLineOfSight(path[current], path[i], grid)) {
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

  private static hasLineOfSight(start: { x: number, y: number }, end: { x: number, y: number }, grid: any): boolean {
    let dx = Math.abs(end.x - start.x);
    let dy = Math.abs(end.y - start.y);
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
      if (grid.isObstacle(x, y)) {
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
