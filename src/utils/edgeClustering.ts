
export interface ClusterableEdge {
  edge: any;
  startPoint: { x: number, y: number };
  endPoint: { x: number, y: number };
  direction: number;
  length: number;
  midPoint: { x: number, y: number };
}

export class EdgeClustering {
  private maxBundleDistance: number;
  private minEdgesForBundle: number;

  constructor(maxBundleDistance: number = 100, minEdgesForBundle: number = 2) {
    this.maxBundleDistance = maxBundleDistance;
    this.minEdgesForBundle = minEdgesForBundle;
  }

  public clusterSimilarEdges(edgeData: ClusterableEdge[]): ClusterableEdge[][] {
    const clusters: ClusterableEdge[][] = [];
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

      if (cluster.length >= this.minEdgesForBundle) {
        clusters.push(cluster);
      }
    }

    return clusters;
  }

  private areEdgesSimilar(edge1: ClusterableEdge, edge2: ClusterableEdge): boolean {
    // Check if edges are parallel and close to each other
    const directionDiff = Math.abs(edge1.direction - edge2.direction);
    const normalizedDirDiff = Math.min(directionDiff, 360 - directionDiff);
    
    if (normalizedDirDiff > 30) return false; // Not parallel enough
    
    const midPointDistance = this.calculateDistance(edge1.midPoint, edge2.midPoint);
    return midPointDistance < this.maxBundleDistance;
  }

  private calculateDistance(point1: { x: number, y: number }, point2: { x: number, y: number }): number {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
