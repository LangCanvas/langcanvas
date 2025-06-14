
import { EnhancedNode } from '../types/nodeTypes';
import { getNodeDimensions } from './edgeCalculations';

export class PathfindingUtils {
  public static getConnectionPoints(sourceNode: EnhancedNode, targetNode: EnhancedNode) {
    const sourceDim = getNodeDimensions(sourceNode.type);
    const targetDim = getNodeDimensions(targetNode.type);
    
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

  public static findClearPoint(
    point: { x: number, y: number }, 
    target: { x: number, y: number },
    avoidNode: EnhancedNode,
    grid: any
  ): { x: number, y: number } {
    if (!grid.isObstacle(point.x, point.y)) {
      return point;
    }
    
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
        
        if (grid.isValidPosition(testPoint.x, testPoint.y) && 
            !grid.isObstacle(testPoint.x, testPoint.y)) {
          return testPoint;
        }
      }
    }
    
    return point;
  }
}
