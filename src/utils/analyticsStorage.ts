
export interface AnalyticsEvent {
  id: string;
  userId: string;
  sessionId: string;
  timestamp: number;
  type: 'page_view' | 'feature_usage' | 'session_start' | 'session_end' | 'node_created' | 'edge_created' | 'workflow_exported' | 'workflow_imported';
  data: Record<string, any>;
  route?: string;
}

export interface AggregatedStats {
  totalUniqueUsers: number;
  totalSessions: number;
  totalPageViews: number;
  activeUsers: number;
  featureUsage: Record<string, number>;
  dailyStats: Record<string, number>;
  lastUpdated: number;
}

class AnalyticsStorageManager {
  private dbName = 'LangCanvasAnalytics';
  private version = 1;
  private db: IDBDatabase | null = null;
  private lock = false;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Events store
        if (!db.objectStoreNames.contains('events')) {
          const eventsStore = db.createObjectStore('events', { keyPath: 'id' });
          eventsStore.createIndex('userId', 'userId', { unique: false });
          eventsStore.createIndex('sessionId', 'sessionId', { unique: false });
          eventsStore.createIndex('timestamp', 'timestamp', { unique: false });
          eventsStore.createIndex('type', 'type', { unique: false });
        }

        // Aggregated stats store
        if (!db.objectStoreNames.contains('stats')) {
          db.createObjectStore('stats', { keyPath: 'id' });
        }
      };
    });
  }

  private async acquireLock(): Promise<void> {
    while (this.lock) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    this.lock = true;
  }

  private releaseLock(): void {
    this.lock = false;
  }

  async storeEvent(event: AnalyticsEvent): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.acquireLock();
    
    try {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(['events'], 'readwrite');
        const store = transaction.objectStore('events');
        const request = store.add(event);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } finally {
      this.releaseLock();
    }
  }

  async getEvents(filters?: { userId?: string; sessionId?: string; type?: string; startTime?: number; endTime?: number }): Promise<AnalyticsEvent[]> {
    if (!this.db) await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['events'], 'readonly');
      const store = transaction.objectStore('events');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        let events = request.result;

        // Apply filters
        if (filters) {
          events = events.filter(event => {
            if (filters.userId && event.userId !== filters.userId) return false;
            if (filters.sessionId && event.sessionId !== filters.sessionId) return false;
            if (filters.type && event.type !== filters.type) return false;
            if (filters.startTime && event.timestamp < filters.startTime) return false;
            if (filters.endTime && event.timestamp > filters.endTime) return false;
            return true;
          });
        }

        resolve(events);
      };
    });
  }

  async getAggregatedStats(): Promise<AggregatedStats> {
    const events = await this.getEvents();
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    const uniqueUsers = new Set(events.map(e => e.userId)).size;
    const uniqueSessions = new Set(events.map(e => e.sessionId)).size;
    const totalPageViews = events.filter(e => e.type === 'page_view').length;
    
    // Active users (activity in last 24 hours)
    const recentEvents = events.filter(e => e.timestamp > oneDayAgo);
    const activeUsers = new Set(recentEvents.map(e => e.userId)).size;

    // Feature usage
    const featureUsage: Record<string, number> = {};
    events.filter(e => e.type === 'feature_usage').forEach(event => {
      const feature = event.data.feature || 'unknown';
      featureUsage[feature] = (featureUsage[feature] || 0) + 1;
    });

    // Daily stats (last 30 days)
    const dailyStats: Record<string, number> = {};
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    for (let i = 0; i < 30; i++) {
      const dayStart = now - (i * 24 * 60 * 60 * 1000);
      const dayEnd = dayStart + (24 * 60 * 60 * 1000);
      const dateKey = new Date(dayStart).toISOString().split('T')[0];
      
      const dayEvents = events.filter(e => e.timestamp >= dayStart && e.timestamp < dayEnd);
      dailyStats[dateKey] = new Set(dayEvents.map(e => e.userId)).size;
    }

    return {
      totalUniqueUsers: uniqueUsers,
      totalSessions: uniqueSessions,
      totalPageViews,
      activeUsers,
      featureUsage,
      dailyStats,
      lastUpdated: now
    };
  }

  async cleanup(): Promise<void> {
    if (!this.db) return;

    await this.acquireLock();
    
    try {
      // Remove events older than 90 days
      const cutoffTime = Date.now() - (90 * 24 * 60 * 60 * 1000);
      
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(['events'], 'readwrite');
        const store = transaction.objectStore('events');
        const index = store.index('timestamp');
        const range = IDBKeyRange.upperBound(cutoffTime);
        const request = index.openCursor(range);

        request.onerror = () => reject(request.error);
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };
      });
    } finally {
      this.releaseLock();
    }
  }
}

export const analyticsStorage = new AnalyticsStorageManager();
