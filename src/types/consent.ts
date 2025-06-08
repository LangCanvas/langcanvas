
export interface ConsentState {
  analytics: boolean;
  marketing: boolean;
  hasConsented: boolean;
  consentDate?: string;
  doNotTrack: boolean;
  globalPrivacyControl: boolean;
  optedOut: boolean;
}

export interface ConsentContextType {
  consent: ConsentState;
  updateConsent: (category: keyof Omit<ConsentState, 'hasConsented' | 'consentDate' | 'doNotTrack' | 'globalPrivacyControl' | 'optedOut'>, value: boolean) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  globalOptOut: () => void;
  optBackIn: () => void;
  showBanner: boolean;
  hideBanner: () => void;
}
