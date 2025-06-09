
const PANEL_STORAGE_KEY = 'langcanvas_panel_settings';
const PANEL_VERSION = '1.0';

export interface StoredPanelSettings {
  isLeftPanelVisible: boolean;
  isLeftPanelExpanded: boolean;
  isRightPanelVisible: boolean;
  isRightPanelExpanded: boolean;
  version: string;
  timestamp: number;
}

const DEFAULT_PANEL_SETTINGS: Omit<StoredPanelSettings, 'version' | 'timestamp'> = {
  isLeftPanelVisible: true,
  isLeftPanelExpanded: true,
  isRightPanelVisible: true,
  isRightPanelExpanded: true
};

export const savePanelSettingsToStorage = (settings: Omit<StoredPanelSettings, 'version' | 'timestamp'>): void => {
  try {
    const panelData: StoredPanelSettings = {
      ...settings,
      version: PANEL_VERSION,
      timestamp: Date.now()
    };
    
    localStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify(panelData));
    console.log('💾 Panel settings saved to localStorage');
  } catch (error) {
    console.warn('Failed to save panel settings to localStorage:', error);
  }
};

export const loadPanelSettingsFromStorage = (): Omit<StoredPanelSettings, 'version' | 'timestamp'> => {
  try {
    const stored = localStorage.getItem(PANEL_STORAGE_KEY);
    if (!stored) {
      return DEFAULT_PANEL_SETTINGS;
    }

    const panelData: StoredPanelSettings = JSON.parse(stored);
    
    // Version check for future migrations
    if (panelData.version !== PANEL_VERSION) {
      console.warn('Panel settings version mismatch, using defaults');
      return DEFAULT_PANEL_SETTINGS;
    }

    console.log('📂 Panel settings loaded from localStorage');
    return {
      isLeftPanelVisible: panelData.isLeftPanelVisible,
      isLeftPanelExpanded: panelData.isLeftPanelExpanded,
      isRightPanelVisible: panelData.isRightPanelVisible,
      isRightPanelExpanded: panelData.isRightPanelExpanded
    };
  } catch (error) {
    console.warn('Failed to load panel settings from localStorage:', error);
    return DEFAULT_PANEL_SETTINGS;
  }
};

export const clearPanelSettingsFromStorage = (): void => {
  try {
    localStorage.removeItem(PANEL_STORAGE_KEY);
    console.log('🗑️ Panel settings cleared from localStorage');
  } catch (error) {
    console.warn('Failed to clear panel settings from localStorage:', error);
  }
};
