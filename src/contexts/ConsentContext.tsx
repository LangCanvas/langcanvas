
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ConsentState, ConsentContextType } from '@/types/consent';
import { ConsentStorage } from '@/utils/consentStorage';
import { UserIdentificationManager } from '@/utils/userIdentification';
import { usePrivacySignals } from '@/hooks/usePrivacySignals';

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
  const privacyStatus = usePrivacySignals();

  useEffect(() => {
    // Load consent from localStorage
    const storedConsent = ConsentStorage.loadConsent();
    
    if (storedConsent) {
      const updatedConsent = {
        ...storedConsent,
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
      if (storedConsent.analytics && storedConsent.hasConsented && privacyStatus.trackingAllowed) {
        UserIdentificationManager.startSession(true);
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
  }, [privacyStatus]);

  const saveConsent = async (newConsent: ConsentState) => {
    const savedConsent = await ConsentStorage.saveConsent(newConsent);
    setConsent(savedConsent);
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
