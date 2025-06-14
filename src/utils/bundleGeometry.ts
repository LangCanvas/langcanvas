
export class BundleGeometry {
  public static calculateDirection(start: { x: number, y: number }, end: { x: number, y: number }): number {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    return Math.atan2(dy, dx) * 180 / Math.PI;
  }

  public static calculateDistance(point1: { x: number, y: number }, point2: { x: number, y: number }): number {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public static calculatePerpendicular(start: { x: number, y: number }, end: { x: number, y: number }): { x: number, y: number } {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return { x: 0, y: 1 };
    
    return {
      x: -dy / length,
      y: dx / length
    };
  }

  public static createBundleControlPoints(
    cluster: any[], 
    bundleStrength: number
  ): Array<{ x: number, y: number }> {
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
    const bundleOffset = bundleStrength * 50;
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
}
