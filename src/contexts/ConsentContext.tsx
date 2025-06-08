import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { firestoreAnalytics } from '@/utils/firestoreAnalytics';
import { UserIdentificationManager } from '@/utils/userIdentification';
import { DoNotTrackDetector } from '@/utils/doNotTrackDetection';

interface ConsentState {
  analytics: boolean;
  marketing: boolean;
  hasConsented: boolean;
  consentDate?: string;
  doNotTrack: boolean;
  globalPrivacyControl: boolean;
  optedOut: boolean;
}

interface ConsentContextType {
  consent: ConsentState;
  updateConsent: (category: keyof Omit<ConsentState, 'hasConsented' | 'consentDate' | 'doNotTrack' | 'globalPrivacyControl' | 'optedOut'>, value: boolean) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  globalOptOut: () => void;
  optBackIn: () => void;
  showBanner: boolean;
  hideBanner: () => void;
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

export const useConsent = () => {
  const context = useContext(ConsentContext);
  if (context === undefined) {
    throw new Error('useConsent must be used within a ConsentProvider');
  }
  return context;
};

interface ConsentProviderProps {
  children: ReactNode;
}

export const ConsentProvider: React.FC<ConsentProviderProps> = ({ children }) => {
  const [consent, setConsent] = useState<ConsentState>({
    analytics: false,
    marketing: false,
    hasConsented: false,
    doNotTrack: false,
    globalPrivacyControl: false,
    optedOut: false,
  });
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Get privacy signals
    const privacyStatus = UserIdentificationManager.getPrivacyStatus();
    
    // Load consent from localStorage
    const storedConsent = localStorage.getItem('langcanvas-consent');
    if (storedConsent) {
      try {
        const parsed = JSON.parse(storedConsent);
        const updatedConsent = {
          ...parsed,
          doNotTrack: privacyStatus.doNotTrack,
          globalPrivacyControl: privacyStatus.globalPrivacyControl,
          optedOut: privacyStatus.optedOut,
        };
        setConsent(updatedConsent);
        
        // Don't show banner if DNT is enabled or user opted out
        if (!privacyStatus.trackingAllowed || privacyStatus.optedOut) {
          setShowBanner(false);
        } else {
          setShowBanner(false);
        }
        
        // Start analytics session if consent is granted and tracking is allowed
        if (parsed.analytics && parsed.hasConsented && privacyStatus.trackingAllowed) {
          UserIdentificationManager.startSession(true);
        }
      } catch (error) {
        console.error('Error parsing stored consent:', error);
        // Show banner only if tracking is allowed
        setShowBanner(privacyStatus.trackingAllowed);
      }
    } else {
      // No consent found, show banner only if tracking is allowed
      setConsent(prev => ({
        ...prev,
        doNotTrack: privacyStatus.doNotTrack,
        globalPrivacyControl: privacyStatus.globalPrivacyControl,
        optedOut: privacyStatus.optedOut,
      }));
      setShowBanner(privacyStatus.trackingAllowed);
    }
  }, []);

  const saveConsent = async (newConsent: ConsentState) => {
    // Respect DNT and privacy signals
    if (!UserIdentificationManager.shouldAllowTracking()) {
      console.log('🔒 Tracking blocked by privacy settings');
      return;
    }

    const consentWithDate = {
      ...newConsent,
      consentDate: new Date().toISOString(),
      hasConsented: true,
    };
    
    localStorage.setItem('langcanvas-consent', JSON.stringify(consentWithDate));
    setConsent(consentWithDate);

    // Store consent record in Firestore
    try {
      const userId = UserIdentificationManager.getUserId() || UserIdentificationManager.generateUserId();
      if (!UserIdentificationManager.getUserId()) {
        UserIdentificationManager.setUserId(userId);
      }

      await firestoreAnalytics.storeConsentRecord({
        userId,
        hasConsented: true,
        analytics: newConsent.analytics,
        functional: true,
        marketing: newConsent.marketing,
        ipHash: await hashIP(),
        userAgent: navigator.userAgent
      });

      // Start or end analytics session based on consent
      if (newConsent.analytics) {
        await UserIdentificationManager.startSession(true);
      } else {
        await UserIdentificationManager.endSession();
      }
    } catch (error) {
      console.warn('Failed to store consent record:', error);
    }
  };

  const hashIP = async (): Promise<string> => {
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
  };

  const updateConsent = (category: keyof Omit<ConsentState, 'hasConsented' | 'consentDate' | 'doNotTrack' | 'globalPrivacyControl' | 'optedOut'>, value: boolean) => {
    const newConsent = {
      ...consent,
      [category]: value,
    };
    saveConsent(newConsent);
  };

  const acceptAll = () => {
    const newConsent = {
      analytics: true,
      marketing: false,
      hasConsented: true,
      doNotTrack: consent.doNotTrack,
      globalPrivacyControl: consent.globalPrivacyControl,
      optedOut: consent.optedOut,
    };
    saveConsent(newConsent);
    setShowBanner(false);
  };

  const rejectAll = () => {
    const newConsent = {
      analytics: false,
      marketing: false,
      hasConsented: true,
      doNotTrack: consent.doNotTrack,
      globalPrivacyControl: consent.globalPrivacyControl,
      optedOut: consent.optedOut,
    };
    saveConsent(newConsent);
    setShowBanner(false);
  };

  const globalOptOut = async () => {
    await UserIdentificationManager.globalOptOut();
    setConsent(prev => ({
      ...prev,
      analytics: false,
      marketing: false,
      hasConsented: true,
      optedOut: true,
    }));
    setShowBanner(false);
  };

  const optBackIn = async () => {
    await UserIdentificationManager.optBackIn();
    setConsent(prev => ({
      ...prev,
      optedOut: false,
    }));
    // Show banner again for consent choice
    if (UserIdentificationManager.shouldAllowTracking()) {
      setShowBanner(true);
    }
  };

  const hideBanner = () => {
    setShowBanner(false);
  };

  return (
    <ConsentContext.Provider value={{
      consent,
      updateConsent,
      acceptAll,
      rejectAll,
      globalOptOut,
      optBackIn,
      showBanner,
      hideBanner,
    }}>
      {children}
    </ConsentContext.Provider>
  );
};
