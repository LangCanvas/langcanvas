
export class PathfindingHeuristics {
  public static manhattanDistance(a: { x: number, y: number }, b: { x: number, y: number }): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  public static euclideanDistance(a: { x: number, y: number }, b: { x: number, y: number }): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public static octileDistance(current: { x: number, y: number }, goal: { x: number, y: number }): number {
    const dx = Math.abs(current.x - goal.x);
    const dy = Math.abs(current.y - goal.y);
    return Math.max(dx, dy) + (Math.sqrt(2) - 1) * Math.min(dx, dy);
  }
}
