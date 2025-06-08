
import { ConsentState } from '@/types/consent';
import { firestoreAnalytics } from '@/utils/firestoreAnalytics';
import { UserIdentificationManager } from '@/utils/userIdentification';

export class ConsentStorage {
  private static readonly CONSENT_KEY = 'langcanvas-consent';

  static loadConsent(): ConsentState | null {
    try {
      const stored = localStorage.getItem(this.CONSENT_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading consent:', error);
      return null;
    }
  }

  static async saveConsent(consent: ConsentState): Promise<ConsentState> {
    // Respect DNT and privacy signals
    if (!UserIdentificationManager.shouldAllowTracking()) {
      console.log('🔒 Tracking blocked by privacy settings');
      return consent;
    }

    const consentWithDate = {
      ...consent,
      consentDate: new Date().toISOString(),
      hasConsented: true,
    };
    
    try {
      localStorage.setItem(this.CONSENT_KEY, JSON.stringify(consentWithDate));

      // Store consent record in Firestore
      const userId = UserIdentificationManager.getUserId() || UserIdentificationManager.generateUserId();
      if (!UserIdentificationManager.getUserId()) {
        UserIdentificationManager.setUserId(userId);
      }

      await firestoreAnalytics.storeConsentRecord({
        userId,
        hasConsented: true,
        analytics: consent.analytics,
        functional: true,
        marketing: consent.marketing,
        ipHash: await this.hashIP(),
        userAgent: navigator.userAgent
      });

      // Start or end analytics session based on consent
      if (consent.analytics) {
        await UserIdentificationManager.startSession(true);
      } else {
        await UserIdentificationManager.endSession();
      }
    } catch (error) {
      console.warn('Failed to store consent record:', error);
    }

    return consentWithDate;
  }

  private static async hashIP(): Promise<string> {
    try {
      const fingerprint = navigator.userAgent + navigator.language + screen.width + screen.height;
      const encoder = new TextEncoder();
      const data = encoder.encode(fingerprint);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
    } catch (error) {
      console.warn('Failed to create privacy hash:', error);
      return 'unknown';
    }
  }
}
