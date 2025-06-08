
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
      } catch (error) {
        console.error('Error parsing stored consent:', error);
        setShowBanner(true);
      }
    } else {
      // No consent found, show banner
      setShowBanner(true);
    }
  }, []);

  const saveConsent = (newConsent: ConsentState) => {
    const consentWithDate = {
      ...newConsent,
      consentDate: new Date().toISOString(),
      hasConsented: true,
    };
    
    localStorage.setItem('langcanvas-consent', JSON.stringify(consentWithDate));
    setConsent(consentWithDate);
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
