
const PANEL_STORAGE_KEY = 'langcanvas_panel_settings';
const PANEL_VERSION = '2.5'; // Updated version for simplified defaults

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
  isRightPanelVisible: true, // ALWAYS visible by default
  isRightPanelExpanded: true,
  leftPanelWidth: 95,
  rightPanelWidth: 320
};

const validatePanelSettings = (settings: any): boolean => {
  try {
    return (
      typeof settings === 'object' &&
      settings !== null &&
      typeof settings.isLeftPanelVisible === 'boolean' &&
      typeof settings.isRightPanelVisible === 'boolean' &&
      typeof settings.leftPanelWidth === 'number' &&
      typeof settings.rightPanelWidth === 'number' &&
      settings.leftPanelWidth > 0 &&
      settings.rightPanelWidth > 0
    );
  } catch {
    return false;
  }
};

export const savePanelSettingsToStorage = (settings: Omit<StoredPanelSettings, 'version' | 'timestamp'>): void => {
  try {
    // Validate settings before saving
    if (!validatePanelSettings(settings)) {
      console.warn('⚠️ Invalid panel settings provided, using defaults');
      settings = DEFAULT_PANEL_SETTINGS;
    }

    // Force left panel to always be visible
    const panelData: StoredPanelSettings = {
      ...settings,
      isLeftPanelVisible: true, // Override any false values
      version: PANEL_VERSION,
      timestamp: Date.now()
    };
    
    localStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify(panelData));
    console.log('💾 Panel settings saved to localStorage:', {
      rightPanelVisible: panelData.isRightPanelVisible,
      version: panelData.version,
      timestamp: new Date(panelData.timestamp).toISOString()
    });
  } catch (error) {
    console.warn('❌ Failed to save panel settings to localStorage:', error);
  }
};

export const loadPanelSettingsFromStorage = (): Omit<StoredPanelSettings, 'version' | 'timestamp'> => {
  try {
    const stored = localStorage.getItem(PANEL_STORAGE_KEY);
    console.log('🔧 loadPanelSettingsFromStorage raw stored:', stored);
    
    if (!stored) {
      console.log('🆕 No stored panel settings found - Properties Panel will be visible by default');
      return DEFAULT_PANEL_SETTINGS;
    }

    let panelData: StoredPanelSettings;
    try {
      panelData = JSON.parse(stored);
    } catch (parseError) {
      console.warn('🔧 Corrupted panel settings detected, resetting to defaults - Properties Panel will be visible');
      localStorage.removeItem(PANEL_STORAGE_KEY);
      return DEFAULT_PANEL_SETTINGS;
    }
    
    // SIMPLIFIED: Handle version migration more predictably
    if (panelData.version !== PANEL_VERSION || !validatePanelSettings(panelData)) {
      console.log(`🔄 Migrating panel settings from ${panelData.version || 'unknown'} to ${PANEL_VERSION}`);
      
      // Clear old storage and return defaults - simpler approach
      localStorage.removeItem(PANEL_STORAGE_KEY);
      return DEFAULT_PANEL_SETTINGS;
    }

    console.log('📂 Panel settings loaded from localStorage:', {
      rightPanelVisible: panelData.isRightPanelVisible,
      version: panelData.version,
      timestamp: new Date(panelData.timestamp).toISOString()
    });

    const loadedSettings = {
      isLeftPanelVisible: true, // Always force to true
      isLeftPanelExpanded: panelData.isLeftPanelExpanded ?? true,
      isRightPanelVisible: panelData.isRightPanelVisible ?? true, // Default to true if missing
      isRightPanelExpanded: panelData.isRightPanelExpanded ?? true,
      leftPanelWidth: panelData.leftPanelWidth || DEFAULT_PANEL_SETTINGS.leftPanelWidth,
      rightPanelWidth: panelData.rightPanelWidth || DEFAULT_PANEL_SETTINGS.rightPanelWidth
    };

    console.log('🔧 Final loaded settings:', JSON.stringify(loadedSettings, null, 2));
    return loadedSettings;
  } catch (error) {
    console.warn('❌ Failed to load panel settings from localStorage, using defaults - Properties Panel will be visible:', error);
    return DEFAULT_PANEL_SETTINGS;
  }
};

export const clearPanelSettingsFromStorage = (): void => {
  try {
    localStorage.removeItem(PANEL_STORAGE_KEY);
    localStorage.removeItem('langcanvas_panel_widths'); // Clean up old storage
    console.log('🗑️ Panel settings cleared from localStorage');
  } catch (error) {
    console.warn('❌ Failed to clear panel settings from localStorage:', error);
  }
};

// Recovery function to force reset panel settings if needed
export const forceResetPanelSettings = (): void => {
  try {
    clearPanelSettingsFromStorage();
    savePanelSettingsToStorage(DEFAULT_PANEL_SETTINGS);
    console.log('🔄 Panel settings force-reset to defaults');
  } catch (error) {
    console.warn('❌ Failed to force reset panel settings:', error);
  }
};

// DEBUG: Expose global debugging functions for panel storage
(window as any).debugPanelStorage = {
  get: () => localStorage.getItem(PANEL_STORAGE_KEY),
  load: loadPanelSettingsFromStorage,
  save: savePanelSettingsToStorage,
  clear: clearPanelSettingsFromStorage,
  reset: forceResetPanelSettings,
  defaults: DEFAULT_PANEL_SETTINGS
};
