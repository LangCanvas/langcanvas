
import { AnalyticsEvent } from '@/utils/analyticsStorage';

export interface ComputedStats {
  totalUniqueUsers: number;
  totalSessions: number;
  totalPageViews: number;
  activeUsers: number;
  featureUsage: Record<string, number>;
  dailyStats: Record<string, number>;
  lastUpdated: number;
}

export class AnalyticsComputation {
  static computeStatsFromEvents(events: AnalyticsEvent[]): ComputedStats {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    const uniqueUsers = new Set(events.map(e => e.userId)).size;
    const uniqueSessions = new Set(events.map(e => e.sessionId)).size;
    const totalPageViews = events.filter(e => e.type === 'page_view').length;
    
    const recentEvents = events.filter(e => e.timestamp > oneDayAgo);
    const activeUsers = new Set(recentEvents.map(e => e.userId)).size;

    const featureUsage: Record<string, number> = {};
    events.filter(e => e.type === 'feature_usage').forEach(event => {
      const feature = event.data.feature || 'unknown';
      featureUsage[feature] = (featureUsage[feature] || 0) + 1;
    });

    const dailyStats: Record<string, number> = {};
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
}
