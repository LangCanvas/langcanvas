
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { firestoreAnalytics } from '@/utils/firestoreAnalytics';
import { UserIdentificationManager } from '@/utils/userIdentification';

interface ConsentState {
  analytics: boolean;
  marketing: boolean;
  hasConsented: boolean;
  consentDate?: string;
}

interface ConsentContextType {
  consent: ConsentState;
  updateConsent: (category: keyof Omit<ConsentState, 'hasConsented' | 'consentDate'>, value: boolean) => void;
  acceptAll: () => void;
  rejectAll: () => void;
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
  });
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Load consent from localStorage
    const storedConsent = localStorage.getItem('langcanvas-consent');
    if (storedConsent) {
      try {
        const parsed = JSON.parse(storedConsent);
        setConsent(parsed);
        setShowBanner(false);
        
        // Start analytics session if consent is granted
        if (parsed.analytics && parsed.hasConsented) {
          UserIdentificationManager.startSession(true);
        }
      } catch (error) {
        console.error('Error parsing stored consent:', error);
        setShowBanner(true);
      }
    } else {
      // No consent found, show banner
      setShowBanner(true);
    }
  }, []);

  const saveConsent = async (newConsent: ConsentState) => {
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
        functional: true, // Always true for essential functionality
        marketing: newConsent.marketing,
        ipHash: await hashIP(), // Optional: hash IP for privacy
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

  // Simple IP hashing for privacy compliance
  const hashIP = async (): Promise<string> => {
    try {
      // Get user's IP (in a real app, this would come from a server endpoint)
      // For privacy, we're just creating a simple hash of browser fingerprint
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

  const updateConsent = (category: keyof Omit<ConsentState, 'hasConsented' | 'consentDate'>, value: boolean) => {
    const newConsent = {
      ...consent,
      [category]: value,
    };
    saveConsent(newConsent);
  };

  const acceptAll = () => {
    const newConsent = {
      analytics: true,
      marketing: false, // We don't have marketing cookies yet
      hasConsented: true,
    };
    saveConsent(newConsent);
    setShowBanner(false);
  };

  const rejectAll = () => {
    const newConsent = {
      analytics: false,
      marketing: false,
      hasConsented: true,
    };
    saveConsent(newConsent);
    setShowBanner(false);
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
      showBanner,
      hideBanner,
    }}>
      {children}
    </ConsentContext.Provider>
  );
};
