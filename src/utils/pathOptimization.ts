export class PathOptimizer {
  public static optimizeWaypoints(waypoints: Array<{ x: number, y: number }>): Array<{ x: number, y: number }> {
    if (waypoints.length <= 2) return waypoints;
    
    const optimized = [waypoints[0]];
    
    for (let i = 1; i < waypoints.length - 1; i++) {
      const prev = waypoints[i - 1];
      const current = waypoints[i];
      const next = waypoints[i + 1];
      
      // Check if this waypoint is necessary (not collinear)
      const dx1 = current.x - prev.x;
      const dy1 = current.y - prev.y;
      const dx2 = next.x - current.x;
      const dy2 = next.y - current.y;
      
      // Cross product to check if points are collinear
      const cross = dx1 * dy2 - dy1 * dx2;
      
      // If not collinear (with small tolerance), keep the waypoint
      if (Math.abs(cross) > 0.1) {
        optimized.push(current);
      }
    }
    
    optimized.push(waypoints[waypoints.length - 1]);
    return optimized;
  }
}
