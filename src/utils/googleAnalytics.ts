
import { analytics } from '@/config/firebase';
import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';

interface GAEventParams {
  [key: string]: string | number | boolean;
}

class GoogleAnalyticsManager {
  private isEnabled: boolean = false;

  constructor() {
    this.isEnabled = !!analytics;
  }

  setUserId(userId: string): void {
    if (!this.isEnabled || !analytics) return;
    
    try {
      setUserId(analytics, userId);
    } catch (error) {
      console.warn('Failed to set GA user ID:', error);
    }
  }

  setUserProperties(properties: { [key: string]: string }): void {
    if (!this.isEnabled || !analytics) return;
    
    try {
      setUserProperties(analytics, properties);
    } catch (error) {
      console.warn('Failed to set GA user properties:', error);
    }
  }

  trackPageView(path: string, title?: string): void {
    if (!this.isEnabled || !analytics) return;
    
    try {
      logEvent(analytics, 'page_view', {
        page_path: path,
        page_title: title || document.title,
        page_location: window.location.href
      });
    } catch (error) {
      console.warn('Failed to track page view:', error);
    }
  }

  trackFeatureUsage(feature: string, details: GAEventParams = {}): void {
    if (!this.isEnabled || !analytics) return;
    
    try {
      logEvent(analytics, 'feature_usage', {
        feature_name: feature,
        ...details
      });
    } catch (error) {
      console.warn('Failed to track feature usage:', error);
    }
  }

  trackNodeCreated(nodeType: string): void {
    if (!this.isEnabled || !analytics) return;
    
    try {
      logEvent(analytics, 'node_created', {
        node_type: nodeType,
        event_category: 'workflow',
        event_label: 'node_creation'
      });
    } catch (error) {
      console.warn('Failed to track node creation:', error);
    }
  }

  trackEdgeCreated(sourceType: string, targetType: string): void {
    if (!this.isEnabled || !analytics) return;
    
    try {
      logEvent(analytics, 'edge_created', {
        source_type: sourceType,
        target_type: targetType,
        event_category: 'workflow',
        event_label: 'edge_creation'
      });
    } catch (error) {
      console.warn('Failed to track edge creation:', error);
    }
  }

  trackWorkflowExported(nodeCount: number, edgeCount: number): void {
    if (!this.isEnabled || !analytics) return;
    
    try {
      logEvent(analytics, 'workflow_exported', {
        node_count: nodeCount,
        edge_count: edgeCount,
        event_category: 'workflow',
        event_label: 'export',
        value: nodeCount + edgeCount
      });
    } catch (error) {
      console.warn('Failed to track workflow export:', error);
    }
  }

  trackWorkflowImported(nodeCount: number, edgeCount: number): void {
    if (!this.isEnabled || !analytics) return;
    
    try {
      logEvent(analytics, 'workflow_imported', {
        node_count: nodeCount,
        edge_count: edgeCount,
        event_category: 'workflow',
        event_label: 'import',
        value: nodeCount + edgeCount
      });
    } catch (error) {
      console.warn('Failed to track workflow import:', error);
    }
  }

  trackCustomEvent(eventName: string, parameters: GAEventParams): void {
    if (!this.isEnabled || !analytics) return;
    
    try {
      logEvent(analytics, eventName, parameters);
    } catch (error) {
      console.warn('Failed to track custom event:', error);
    }
  }

  trackConversion(conversionName: string, value?: number): void {
    if (!this.isEnabled || !analytics) return;
    
    try {
      logEvent(analytics, 'conversion', {
        conversion_name: conversionName,
        value: value || 1,
        currency: 'USD'
      });
    } catch (error) {
      console.warn('Failed to track conversion:', error);
    }
  }
}

export const googleAnalytics = new GoogleAnalyticsManager();
