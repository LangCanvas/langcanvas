
import { EnhancedEdge } from '../types/edgeTypes';
import { EnhancedNode } from '../types/nodeTypes';
import { EdgeClustering, ClusterableEdge } from './edgeClustering';
import { BundleGeometry } from './bundleGeometry';

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
  private clustering: EdgeClustering;

  constructor(settings: BundlingSettings = defaultBundlingSettings) {
    this.settings = settings;
    this.clustering = new EdgeClustering(
      settings.maxBundleDistance, 
      settings.minEdgesForBundle
    );
  }

  public updateSettings(newSettings: Partial<BundlingSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.clustering = new EdgeClustering(
      this.settings.maxBundleDistance,
      this.settings.minEdgesForBundle
    );
  }

  public calculateBundles(
    edges: EnhancedEdge[], 
    nodes: EnhancedNode[]
  ): BundleGroup[] {
    if (!this.settings.enabled || edges.length < this.settings.minEdgesForBundle) {
      return [];
    }

    const edgeData = this.preprocessEdges(edges, nodes);
    const clusters = this.clustering.clusterSimilarEdges(edgeData);
    return this.createBundleGroups(clusters);
  }

  private preprocessEdges(edges: EnhancedEdge[], nodes: EnhancedNode[]): ClusterableEdge[] {
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
      
      const direction = BundleGeometry.calculateDirection(startPoint, endPoint);
      const length = BundleGeometry.calculateDistance(startPoint, endPoint);
      
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
    }).filter(Boolean) as ClusterableEdge[];
  }

  private createBundleGroups(clusters: ClusterableEdge[][]): BundleGroup[] {
    return clusters.map((cluster, index) => {
      const bundleId = `bundle-${index}`;
      const edges = cluster.map(item => item.edge);
      
      const controlPoints = BundleGeometry.createBundleControlPoints(
        cluster, 
        this.settings.bundleStrength
      );
      
      return {
        id: bundleId,
        edges,
        controlPoints,
        bundleStrength: this.settings.bundleStrength,
        separationDistance: this.settings.separationDistance
      };
    });
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
