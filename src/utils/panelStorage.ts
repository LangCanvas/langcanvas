
const PANEL_STORAGE_KEY = 'langcanvas_panel_settings';
const PANEL_VERSION = '2.0'; // Updated version to consolidate width storage

export interface StoredPanelSettings {
  isLeftPanelVisible: boolean;
  isLeftPanelExpanded: boolean;
  isRightPanelVisible: boolean;
  isRightPanelExpanded: boolean;
  leftPanelWidth: number;
  rightPanelWidth: number;
  version: string;
  timestamp: number;
}

const DEFAULT_PANEL_SETTINGS: Omit<StoredPanelSettings, 'version' | 'timestamp'> = {
  isLeftPanelVisible: true,
  isLeftPanelExpanded: true,
  isRightPanelVisible: true,
  isRightPanelExpanded: true,
  leftPanelWidth: 95,
  rightPanelWidth: 320
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
    
    // Handle version migration from older versions
    if (panelData.version !== PANEL_VERSION) {
      console.log(`Migrating panel settings from ${panelData.version || 'unknown'} to ${PANEL_VERSION}`);
      // Clear old storage systems
      localStorage.removeItem('langcanvas_panel_widths');
      return {
        isLeftPanelVisible: panelData.isLeftPanelVisible ?? true,
        isLeftPanelExpanded: panelData.isLeftPanelExpanded ?? true,
        isRightPanelVisible: panelData.isRightPanelVisible ?? true,
        isRightPanelExpanded: panelData.isRightPanelExpanded ?? true,
        leftPanelWidth: panelData.leftPanelWidth || 95,
        rightPanelWidth: panelData.rightPanelWidth || 320
      };
    }

    console.log('📂 Panel settings loaded from localStorage');
    return {
      isLeftPanelVisible: panelData.isLeftPanelVisible,
      isLeftPanelExpanded: panelData.isLeftPanelExpanded,
      isRightPanelVisible: panelData.isRightPanelVisible,
      isRightPanelExpanded: panelData.isRightPanelExpanded,
      leftPanelWidth: panelData.leftPanelWidth,
      rightPanelWidth: panelData.rightPanelWidth
    };
  } catch (error) {
    console.warn('Failed to load panel settings from localStorage:', error);
    return DEFAULT_PANEL_SETTINGS;
  }
};

export const clearPanelSettingsFromStorage = (): void => {
  try {
    localStorage.removeItem(PANEL_STORAGE_KEY);
    localStorage.removeItem('langcanvas_panel_widths'); // Clean up old storage
    console.log('🗑️ Panel settings cleared from localStorage');
  } catch (error) {
    console.warn('Failed to clear panel settings from localStorage:', error);
  }
};
