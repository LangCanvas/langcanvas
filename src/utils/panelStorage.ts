
const PANEL_STORAGE_KEY = 'langcanvas_panel_settings';
const PANEL_VERSION = '2.2'; // Updated version to force reset of right panel visibility

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
  isLeftPanelVisible: true, // Always visible by default
  isLeftPanelExpanded: true,
  isRightPanelVisible: true, // Ensure right panel is visible by default
  isRightPanelExpanded: true,
  leftPanelWidth: 95,
  rightPanelWidth: 320
};

export const savePanelSettingsToStorage = (settings: Omit<StoredPanelSettings, 'version' | 'timestamp'>): void => {
  try {
    // Force left panel to always be visible, ensure right panel defaults to visible
    const panelData: StoredPanelSettings = {
      ...settings,
      isLeftPanelVisible: true, // Override any false values
      isRightPanelVisible: settings.isRightPanelVisible ?? true, // Default to true if undefined
      version: PANEL_VERSION,
      timestamp: Date.now()
    };
    
    localStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify(panelData));
    console.log('💾 Panel settings saved to localStorage (left panel forced visible, right panel defaulted)');
  } catch (error) {
    console.warn('Failed to save panel settings to localStorage:', error);
  }
};

export const loadPanelSettingsFromStorage = (): Omit<StoredPanelSettings, 'version' | 'timestamp'> => {
  try {
    const stored = localStorage.getItem(PANEL_STORAGE_KEY);
    if (!stored) {
      console.log('🔧 No stored panel settings found, using defaults');
      return DEFAULT_PANEL_SETTINGS;
    }

    const panelData: StoredPanelSettings = JSON.parse(stored);
    
    // Handle version migration - force reset for version 2.2
    if (panelData.version !== PANEL_VERSION) {
      console.log(`🔄 Migrating panel settings from ${panelData.version || 'unknown'} to ${PANEL_VERSION} - resetting visibility`);
      // Clear old storage systems
      localStorage.removeItem('langcanvas_panel_widths');
      localStorage.removeItem(PANEL_STORAGE_KEY); // Clear the old settings
      return DEFAULT_PANEL_SETTINGS;
    }

    console.log('📂 Panel settings loaded from localStorage');
    return {
      isLeftPanelVisible: true, // Always force to true, regardless of stored value
      isLeftPanelExpanded: panelData.isLeftPanelExpanded ?? true,
      isRightPanelVisible: panelData.isRightPanelVisible ?? true, // Force default to true
      isRightPanelExpanded: panelData.isRightPanelExpanded ?? true,
      leftPanelWidth: panelData.leftPanelWidth || 95,
      rightPanelWidth: panelData.rightPanelWidth || 320
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
