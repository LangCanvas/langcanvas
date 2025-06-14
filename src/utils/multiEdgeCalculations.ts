
import { EnhancedNode } from '../types/nodeTypes';
import { EnhancedEdge } from '../types/edgeTypes';
import { calculateEnhancedOrthogonalPath } from './enhancedEdgeCalculations';

export interface MultiEdgeGroup {
  sourceId: string;
  targetId: string;
  edges: EnhancedEdge[];
  baseIndex: number;
}

export class MultiEdgeCalculator {
  private static readonly EDGE_OFFSET_DISTANCE = 15;
  private static readonly MAX_PARALLEL_EDGES = 5;

  public static groupParallelEdges(edges: EnhancedEdge[]): MultiEdgeGroup[] {
    const edgeGroups = new Map<string, EnhancedEdge[]>();
    
    edges.forEach(edge => {
      const key = `${edge.source}-${edge.target}`;
      if (!edgeGroups.has(key)) {
        edgeGroups.set(key, []);
      }
      edgeGroups.get(key)!.push(edge);
    });

    return Array.from(edgeGroups.entries())
      .filter(([, groupEdges]) => groupEdges.length > 1)
      .map(([key, groupEdges], index) => {
        const [sourceId, targetId] = key.split('-');
        return {
          sourceId,
          targetId,
          edges: groupEdges,
          baseIndex: index
        };
      });
  }

  public static calculateParallelEdgePath(
    sourceNode: EnhancedNode,
    targetNode: EnhancedNode,
    edgeIndex: number,
    totalEdges: number
  ): { x: number; y: number }[] {
    const basePath = calculateEnhancedOrthogonalPath(sourceNode, targetNode);
    
    if (totalEdges === 1) {
      return basePath;
    }

    // Calculate offset for parallel edges
    const offsetDistance = this.calculateEdgeOffset(edgeIndex, totalEdges);
    
    return this.applyOffsetToPath(basePath, offsetDistance);
  }

  private static calculateEdgeOffset(edgeIndex: number, totalEdges: number): number {
    const centerIndex = (totalEdges - 1) / 2;
    const relativeIndex = edgeIndex - centerIndex;
    return relativeIndex * this.EDGE_OFFSET_DISTANCE;
  }

  private static applyOffsetToPath(
    path: { x: number; y: number }[],
    offsetDistance: number
  ): { x: number; y: number }[] {
    if (path.length < 2 || offsetDistance === 0) {
      return path;
    }

    return path.map((point, index) => {
      if (index === 0 || index === path.length - 1) {
        // Don't offset start and end points
        return point;
      }

      // Calculate perpendicular offset for middle points
      const prevPoint = path[index - 1];
      const nextPoint = path[index + 1] || point;
      
      const dx = nextPoint.x - prevPoint.x;
      const dy = nextPoint.y - prevPoint.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      
      if (length === 0) return point;
      
      const perpX = -dy / length * offsetDistance;
      const perpY = dx / length * offsetDistance;
      
      return {
        x: point.x + perpX,
        y: point.y + perpY
      };
    });
  }

  public static getEdgeConnectionStrength(edge: EnhancedEdge): number {
    // Calculate connection strength based on edge type and usage
    let strength = 1;
    
    if (edge.conditional) {
      strength += edge.conditional.condition.priority * 0.1;
    }
    
    return Math.min(strength, 3);
  }
}
