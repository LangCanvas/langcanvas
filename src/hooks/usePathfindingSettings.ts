
import { useState, useCallback } from 'react';

export interface PathfindingSettings {
  enableDebugGrid: boolean;
  pathQuality: 'fast' | 'balanced' | 'smooth';
  cacheEnabled: boolean;
  animatePathChanges: boolean;
  gridCellSize: number;
}

const defaultSettings: PathfindingSettings = {
  enableDebugGrid: false,
  pathQuality: 'balanced',
  cacheEnabled: true,
  animatePathChanges: true,
  gridCellSize: 20
};

export const usePathfindingSettings = () => {
  const [settings, setSettings] = useState<PathfindingSettings>(() => {
    const stored = localStorage.getItem('pathfinding-settings');
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  });

  const updateSetting = useCallback(<K extends keyof PathfindingSettings>(
    key: K, 
    value: PathfindingSettings[K]
  ) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      localStorage.setItem('pathfinding-settings', JSON.stringify(newSettings));
      return newSettings;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    localStorage.removeItem('pathfinding-settings');
  }, []);

  return {
    settings,
    updateSetting,
    resetSettings
  };
};
