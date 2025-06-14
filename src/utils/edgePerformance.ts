export class EdgePerformanceOptimizer {
  private static readonly DEBOUNCE_DELAY = 16; // ~60fps
  private static readonly CACHE_SIZE = 1000;
  
  private static pathCache = new Map<string, { path: Array<{ x: number; y: number }>; timestamp: number }>();
  private static calculationQueue = new Map<string, () => void>();
  private static debounceTimer: NodeJS.Timeout | null = null;

  public static cacheEdgePath(
    edgeId: string, 
    path: Array<{ x: number; y: number }>
  ): void {
    // Clean old cache entries if we're at capacity
    if (this.pathCache.size >= this.CACHE_SIZE) {
      const oldestKey = Array.from(this.pathCache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
      this.pathCache.delete(oldestKey);
    }

    this.pathCache.set(edgeId, {
      path: [...path],
      timestamp: Date.now()
    });
  }

  public static getCachedPath(edgeId: string): Array<{ x: number; y: number }> | null {
    const cached = this.pathCache.get(edgeId);
    if (!cached) return null;

    // Check if cache is still valid (5 seconds)
    if (Date.now() - cached.timestamp > 5000) {
      this.pathCache.delete(edgeId);
      return null;
    }

    return cached.path;
  }

  public static invalidateCache(edgeId?: string): void {
    if (edgeId) {
      this.pathCache.delete(edgeId);
    } else {
      this.pathCache.clear();
    }
  }

  public static debouncedCalculation(
    key: string, 
    calculation: () => void
  ): void {
    this.calculationQueue.set(key, calculation);

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      const calculations = Array.from(this.calculationQueue.values());
      this.calculationQueue.clear();
      
      // Execute calculations in batches
      this.executeBatch(calculations);
    }, this.DEBOUNCE_DELAY);
  }

  private static executeBatch(calculations: (() => void)[]): void {
    const batchSize = 10;
    let index = 0;

    const processBatch = () => {
      const endIndex = Math.min(index + batchSize, calculations.length);
      
      for (let i = index; i < endIndex; i++) {
        try {
          calculations[i]();
        } catch (error) {
          console.warn('Edge calculation error:', error);
        }
      }

      index = endIndex;

      if (index < calculations.length) {
        // Use requestAnimationFrame for smooth processing
        requestAnimationFrame(processBatch);
      }
    };

    processBatch();
  }

  public static optimizeRenderList<T>(
    items: T[],
    getKey: (item: T) => string,
    isVisible: (item: T) => boolean,
    maxItems: number = 200
  ): T[] {
    // First filter by visibility
    const visibleItems = items.filter(isVisible);
    
    // If we're still over the limit, prioritize by some criteria
    if (visibleItems.length <= maxItems) {
      return visibleItems;
    }

    // For now, just take the first N items
    // In a real implementation, you might prioritize by:
    // - Distance from viewport center
    // - Edge importance/weight
    // - User selection state
    return visibleItems.slice(0, maxItems);
  }

  public static measurePerformance<T>(
    operation: () => T,
    label: string
  ): T {
    const start = performance.now();
    const result = operation();
    const end = performance.now();
    
    if (end - start > 16) { // More than one frame
      console.warn(`Slow edge operation: ${label} took ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  }

  public static getCacheStats() {
    return {
      size: this.pathCache.size,
      maxSize: this.CACHE_SIZE,
      queueSize: this.calculationQueue.size
    };
  }
}

export class EdgeLODManager {
  public static getSimplifiedPath(
    originalPath: Array<{ x: number; y: number }>,
    lodLevel: 'high' | 'medium' | 'low'
  ): Array<{ x: number; y: number }> {
    switch (lodLevel) {
      case 'high':
        return originalPath;
      
      case 'medium':
        // Keep every other point for medium detail
        return originalPath.filter((_, index) => index % 2 === 0 || index === originalPath.length - 1);
      
      case 'low':
        // Just start and end points for low detail
        return originalPath.length >= 2 ? [originalPath[0], originalPath[originalPath.length - 1]] : originalPath;
      
      default:
        return originalPath;
    }
  }

  public static getSimplifiedStrokeWidth(
    originalWidth: number,
    lodLevel: 'high' | 'medium' | 'low'
  ): number {
    switch (lodLevel) {
      case 'high':
        return originalWidth;
      case 'medium':
        return Math.max(1, originalWidth - 1);
      case 'low':
        return 1;
      default:
        return originalWidth;
    }
  }

  public static shouldShowMarkers(lodLevel: 'high' | 'medium' | 'low'): boolean {
    return lodLevel === 'high';
  }

  public static shouldShowLabels(lodLevel: 'high' | 'medium' | 'low'): boolean {
    return lodLevel === 'high' || lodLevel === 'medium';
  }
}
