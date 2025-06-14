
interface CachedPathResult {
  result: any;
  timestamp: number;
  gridVersion: number;
}

export class PathfindingCache {
  private cache = new Map<string, CachedPathResult>();
  private gridVersion = 0;
  private maxCacheSize = 1000;
  private cacheTimeout = 30000; // 30 seconds

  public getCacheKey(sourceId: string, targetId: string): string {
    return `${sourceId}-${targetId}`;
  }

  public get(sourceId: string, targetId: string): any | null {
    const key = this.getCacheKey(sourceId, targetId);
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    // Check if cache is stale
    if (cached.gridVersion !== this.gridVersion || 
        Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.result;
  }

  public set(sourceId: string, targetId: string, result: any): void {
    const key = this.getCacheKey(sourceId, targetId);
    
    // Prevent cache from growing too large
    if (this.cache.size >= this.maxCacheSize) {
      this.evictOldest();
    }
    
    this.cache.set(key, {
      result,
      timestamp: Date.now(),
      gridVersion: this.gridVersion
    });
  }

  public invalidateGrid(): void {
    this.gridVersion++;
    this.cache.clear();
  }

  public invalidateNode(nodeId: string): void {
    // Remove all cached paths involving this node
    const keysToDelete: string[] = [];
    
    for (const [key] of this.cache) {
      if (key.includes(nodeId)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    
    for (const [key, cached] of this.cache) {
      if (cached.timestamp < oldestTime) {
        oldestTime = cached.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  public getStats(): { size: number; version: number; hitRate?: number } {
    return {
      size: this.cache.size,
      version: this.gridVersion
    };
  }
}
