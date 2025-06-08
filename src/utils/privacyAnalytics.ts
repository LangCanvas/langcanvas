
interface AnalyticsData {
  userId: string;
  sessions: number;
  pageViews: number;
  firstVisit: string;
  lastVisit: string;
  features: Record<string, number>;
}

class PrivacyAnalytics {
  private static instance: PrivacyAnalytics;
  private consentGiven = false;
  private userId: string;

  private constructor() {
    this.userId = this.generateUserId();
    this.checkConsent();
  }

  public static getInstance(): PrivacyAnalytics {
    if (!PrivacyAnalytics.instance) {
      PrivacyAnalytics.instance = new PrivacyAnalytics();
    }
    return PrivacyAnalytics.instance;
  }

  private generateUserId(): string {
    // Generate a hash-based anonymous ID
    const timestamp = Date.now().toString();
    const random = Math.random().toString();
    const data = timestamp + random + navigator.userAgent;
    
    // Simple hash function for anonymization
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return 'user_' + Math.abs(hash).toString(16);
  }

  private checkConsent(): void {
    try {
      const consent = localStorage.getItem('langcanvas-consent');
      if (consent) {
        const parsed = JSON.parse(consent);
        this.consentGiven = parsed.analytics === true;
      }
    } catch (error) {
      console.warn('Error checking analytics consent:', error);
      this.consentGiven = false;
    }
  }

  private getAnalyticsData(): AnalyticsData {
    const defaultData: AnalyticsData = {
      userId: this.userId,
      sessions: 0,
      pageViews: 0,
      firstVisit: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
      features: {}
    };

    try {
      const stored = localStorage.getItem('langcanvas-analytics');
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultData, ...parsed };
      }
    } catch (error) {
      console.warn('Error loading analytics data:', error);
    }

    return defaultData;
  }

  private saveAnalyticsData(data: AnalyticsData): void {
    try {
      // Add expiration date (30 days from now)
      const dataWithExpiry = {
        ...data,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      localStorage.setItem('langcanvas-analytics', JSON.stringify(dataWithExpiry));
    } catch (error) {
      console.warn('Error saving analytics data:', error);
    }
  }

  public updateConsent(hasConsent: boolean): void {
    this.consentGiven = hasConsent;
    
    if (!hasConsent) {
      // Clear analytics data if consent withdrawn
      localStorage.removeItem('langcanvas-analytics');
    }
  }

  public trackPageView(page: string): void {
    if (!this.consentGiven) return;

    const data = this.getAnalyticsData();
    data.pageViews += 1;
    data.lastVisit = new Date().toISOString();
    
    this.saveAnalyticsData(data);
  }

  public trackSession(): void {
    if (!this.consentGiven) return;

    const sessionKey = 'langcanvas-session';
    const existingSession = sessionStorage.getItem(sessionKey);
    
    if (!existingSession) {
      // New session
      sessionStorage.setItem(sessionKey, 'active');
      
      const data = this.getAnalyticsData();
      data.sessions += 1;
      data.lastVisit = new Date().toISOString();
      
      this.saveAnalyticsData(data);
    }
  }

  public trackFeatureUsage(feature: string): void {
    if (!this.consentGiven) return;

    const data = this.getAnalyticsData();
    data.features[feature] = (data.features[feature] || 0) + 1;
    data.lastVisit = new Date().toISOString();
    
    this.saveAnalyticsData(data);
  }

  public getStats(): AnalyticsData | null {
    if (!this.consentGiven) return null;
    return this.getAnalyticsData();
  }

  public clearAllData(): void {
    localStorage.removeItem('langcanvas-analytics');
    sessionStorage.removeItem('langcanvas-session');
  }

  // Check and clean expired data
  public cleanExpiredData(): void {
    try {
      const stored = localStorage.getItem('langcanvas-analytics');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
          this.clearAllData();
        }
      }
    } catch (error) {
      console.warn('Error cleaning expired data:', error);
    }
  }
}

export const analytics = PrivacyAnalytics.getInstance();

// Hook for React components
export const usePrivacyAnalytics = () => {
  return {
    trackPageView: (page: string) => analytics.trackPageView(page),
    trackSession: () => analytics.trackSession(),
    trackFeature: (feature: string) => analytics.trackFeatureUsage(feature),
    getStats: () => analytics.getStats(),
    updateConsent: (hasConsent: boolean) => analytics.updateConsent(hasConsent),
    clearData: () => analytics.clearAllData(),
  };
};
