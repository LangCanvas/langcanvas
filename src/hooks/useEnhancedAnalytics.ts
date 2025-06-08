
import { useCallback, useEffect } from 'react';
import { useConsent } from '@/contexts/ConsentContext';
import { useLocation } from 'react-router-dom';
import { UserIdentificationManager } from '@/utils/userIdentification';
import { AnalyticsEvent } from '@/utils/analyticsStorage';
import { firestoreAnalytics } from '@/utils/firestoreAnalytics';
import { googleAnalytics } from '@/utils/googleAnalytics';

export const useEnhancedAnalytics = () => {
  const { consent } = useConsent();
  const location = useLocation();

  useEffect(() => {
    if (consent.analytics && consent.hasConsented) {
      UserIdentificationManager.startSession(true);
    }
  }, [consent.analytics, consent.hasConsented]);

  useEffect(() => {
    if (consent.analytics && consent.hasConsented) {
      trackPageView(location.pathname);
    }
  }, [location.pathname, consent.analytics, consent.hasConsented]);

  useEffect(() => {
    return () => {
      if (consent.analytics) {
        UserIdentificationManager.endSession();
      }
    };
  }, []);

  const createEvent = useCallback((
    type: AnalyticsEvent['type'],
    data: Record<string, any> = {},
    route?: string
  ): AnalyticsEvent | null => {
    if (!consent.analytics || !consent.hasConsented) return null;

    const session = UserIdentificationManager.getCurrentSession();
    if (!session) return null;

    return {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: session.userId,
      sessionId: session.sessionId,
      timestamp: Date.now(),
      type,
      data,
      route: route || location.pathname,
    };
  }, [consent.analytics, consent.hasConsented, location.pathname]);

  const trackEvent = useCallback(async (event: AnalyticsEvent | null) => {
    if (!event) return;

    try {
      // Store in both Firestore and send to Google Analytics
      await Promise.all([
        firestoreAnalytics.storeEvent(event),
        // Note: Google Analytics events are sent in the specific track methods below
      ]);
      
      UserIdentificationManager.updateSession();
    } catch (error) {
      console.warn('Failed to track analytics event:', error);
    }
  }, []);

  const trackPageView = useCallback(async (path: string) => {
    const event = createEvent('page_view', { path });
    await trackEvent(event);
    
    // Also send to Google Analytics
    googleAnalytics.trackPageView(path);
  }, [createEvent, trackEvent]);

  const trackFeatureUsage = useCallback(async (feature: string, details: Record<string, any> = {}) => {
    const event = createEvent('feature_usage', { feature, ...details });
    await trackEvent(event);
    
    // Also send to Google Analytics
    googleAnalytics.trackFeatureUsage(feature, details);
  }, [createEvent, trackEvent]);

  const trackNodeCreated = useCallback(async (nodeType: string) => {
    const event = createEvent('node_created', { nodeType });
    await trackEvent(event);
    
    // Also send to Google Analytics
    googleAnalytics.trackNodeCreated(nodeType);
  }, [createEvent, trackEvent]);

  const trackEdgeCreated = useCallback(async (sourceType: string, targetType: string) => {
    const event = createEvent('edge_created', { sourceType, targetType });
    await trackEvent(event);
    
    // Also send to Google Analytics
    googleAnalytics.trackEdgeCreated(sourceType, targetType);
  }, [createEvent, trackEvent]);

  const trackWorkflowExported = useCallback(async (nodeCount: number, edgeCount: number) => {
    const event = createEvent('workflow_exported', { nodeCount, edgeCount });
    await trackEvent(event);
    
    // Also send to Google Analytics
    googleAnalytics.trackWorkflowExported(nodeCount, edgeCount);
  }, [createEvent, trackEvent]);

  const trackWorkflowImported = useCallback(async (nodeCount: number, edgeCount: number) => {
    const event = createEvent('workflow_imported', { nodeCount, edgeCount });
    await trackEvent(event);
    
    // Also send to Google Analytics
    googleAnalytics.trackWorkflowImported(nodeCount, edgeCount);
  }, [createEvent, trackEvent]);

  return {
    trackPageView,
    trackFeatureUsage,
    trackNodeCreated,
    trackEdgeCreated,
    trackWorkflowExported,
    trackWorkflowImported,
    isEnabled: consent.analytics && consent.hasConsented,
  };
};
