
import { useState, useEffect } from 'react';
import { UserIdentificationManager } from '@/utils/userIdentification';

export const usePrivacySignals = () => {
  const [privacyStatus, setPrivacyStatus] = useState(() => 
    UserIdentificationManager.getPrivacyStatus()
  );

  useEffect(() => {
    // Update privacy status on mount and when it might change
    const updatePrivacyStatus = () => {
      setPrivacyStatus(UserIdentificationManager.getPrivacyStatus());
    };

    updatePrivacyStatus();

    // Listen for storage changes that might affect privacy status
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'langcanvas_privacy_optout') {
        updatePrivacyStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return privacyStatus;
};
