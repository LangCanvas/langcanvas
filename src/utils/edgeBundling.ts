
import { EnhancedEdge } from '../types/edgeTypes';
import { EnhancedNode } from '../types/nodeTypes';

export interface BundleGroup {
  id: string;
  edges: EnhancedEdge[];
  controlPoints: Array<{ x: number, y: number }>;
  bundleStrength: number;
  separationDistance: number;
}

export interface BundlingSettings {
  enabled: boolean;
  bundleStrength: number; // 0-1, how tightly edges are bundled
  separationDistance: number; // pixels between bundled edges
  minEdgesForBundle: number; // minimum edges required to form a bundle
  maxBundleDistance: number; // max distance between edges to consider bundling
}

export const defaultBundlingSettings: BundlingSettings = {
  enabled: false,
  bundleStrength: 0.7,
  separationDistance: 8,
  minEdgesForBundle: 2,
  maxBundleDistance: 100
};

export class EdgeBundlingCalculator {
  private settings: BundlingSettings;

  constructor(settings: BundlingSettings = defaultBundlingSettings) {
    this.settings = settings;
  }

  public updateSettings(newSettings: Partial<BundlingSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  public calculateBundles(
    edges: EnhancedEdge[], 
    nodes: EnhancedNode[]
  ): BundleGroup[] {
    if (!this.settings.enabled || edges.length < this.settings.minEdgesForBundle) {
      return [];
    }

    const edgeData = this.preprocessEdges(edges, nodes);
    const clusters = this.clusterSimilarEdges(edgeData);
    return this.createBundleGroups(clusters, edgeData);
  }

  private preprocessEdges(edges: EnhancedEdge[], nodes: EnhancedNode[]) {
    return edges.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (!sourceNode || !targetNode) {
        return null;
      }

      const startPoint = { 
        x: sourceNode.x + 120, 
        y: sourceNode.y + 30 
      };
      const endPoint = { 
        x: targetNode.x, 
        y: targetNode.y + 30 
      };
      
      const direction = this.calculateDirection(startPoint, endPoint);
      const length = this.calculateDistance(startPoint, endPoint);
      
      return {
        edge,
        startPoint,
        endPoint,
        direction,
        length,
        midPoint: {
          x: (startPoint.x + endPoint.x) / 2,
          y: (startPoint.y + endPoint.y) / 2
        }
      };
    }).filter(Boolean);
  }

  private clusterSimilarEdges(edgeData: any[]): any[][] {
    const clusters: any[][] = [];
    const used = new Set<number>();

    for (let i = 0; i < edgeData.length; i++) {
      if (used.has(i)) continue;

      const cluster = [edgeData[i]];
      used.add(i);

      for (let j = i + 1; j < edgeData.length; j++) {
        if (used.has(j)) continue;

        if (this.areEdgesSimilar(edgeData[i], edgeData[j])) {
          cluster.push(edgeData[j]);
          used.add(j);
        }
      }

      if (cluster.length >= this.settings.minEdgesForBundle) {
        clusters.push(cluster);
      }
    }

    return clusters;
  }

  private areEdgesSimilar(edge1: any, edge2: any): boolean {
    // Check if edges are parallel and close to each other
    const directionDiff = Math.abs(edge1.direction - edge2.direction);
    const normalizedDirDiff = Math.min(directionDiff, 360 - directionDiff);
    
    if (normalizedDirDiff > 30) return false; // Not parallel enough
    
    const midPointDistance = this.calculateDistance(edge1.midPoint, edge2.midPoint);
    return midPointDistance < this.settings.maxBundleDistance;
  }

  private createBundleGroups(clusters: any[][], edgeData: any[]): BundleGroup[] {
    return clusters.map((cluster, index) => {
      const bundleId = `bundle-${index}`;
      const edges = cluster.map(item => item.edge);
      
      const controlPoints = this.calculateBundleControlPoints(cluster);
      
      return {
        id: bundleId,
        edges,
        controlPoints,
        bundleStrength: this.settings.bundleStrength,
        separationDistance: this.settings.separationDistance
      };
    });
  }

  private calculateBundleControlPoints(cluster: any[]): Array<{ x: number, y: number }> {
    if (cluster.length === 0) return [];

    // Calculate the bundle center line
    const avgStartX = cluster.reduce((sum, item) => sum + item.startPoint.x, 0) / cluster.length;
    const avgStartY = cluster.reduce((sum, item) => sum + item.startPoint.y, 0) / cluster.length;
    const avgEndX = cluster.reduce((sum, item) => sum + item.endPoint.x, 0) / cluster.length;
    const avgEndY = cluster.reduce((sum, item) => sum + item.endPoint.y, 0) / cluster.length;

    // Create control points for bundling
    const bundleStart = { x: avgStartX, y: avgStartY };
    const bundleEnd = { x: avgEndX, y: avgEndY };
    
    // Add intermediate control points for smooth bundling
    const midX = (bundleStart.x + bundleEnd.x) / 2;
    const midY = (bundleStart.y + bundleEnd.y) / 2;
    
    // Apply bundling strength to control points
    const bundleOffset = this.settings.bundleStrength * 50;
    const perpendicular = this.calculatePerpendicular(bundleStart, bundleEnd);
    
    return [
      bundleStart,
      {
        x: midX + perpendicular.x * bundleOffset,
        y: midY + perpendicular.y * bundleOffset
      },
      bundleEnd
    ];
  }

  private calculateDirection(start: { x: number, y: number }, end: { x: number, y: number }): number {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    return Math.atan2(dy, dx) * 180 / Math.PI;
  }

  private calculateDistance(point1: { x: number, y: number }, point2: { x: number, y: number }): number {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private calculatePerpendicular(start: { x: number, y: number }, end: { x: number, y: number }): { x: number, y: number } {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return { x: 0, y: 1 };
    
    return {
      x: -dy / length,
      y: dx / length
    };
  }

  public getBundleStats() {
    return {
      enabled: this.settings.enabled,
      bundleStrength: this.settings.bundleStrength,
      separationDistance: this.settings.separationDistance,
      minEdgesForBundle: this.settings.minEdgesForBundle
    };
  }
}

// Global instance
let globalBundlingCalculator: EdgeBundlingCalculator | null = null;

export const getEdgeBundlingCalculator = (): EdgeBundlingCalculator => {
  if (!globalBundlingCalculator) {
    globalBundlingCalculator = new EdgeBundlingCalculator();
  }
  return globalBundlingCalculator;
};

export const updateBundlingSettings = (settings: Partial<BundlingSettings>): void => {
  const calculator = getEdgeBundlingCalculator();
  calculator.updateSettings(settings);
};
