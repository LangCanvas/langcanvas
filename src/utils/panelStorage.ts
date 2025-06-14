
const PANEL_STORAGE_KEY = 'langcanvas_panel_settings';
const PANEL_VERSION = '2.3'; // Updated version for improved reliability

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
  isRightPanelVisible: true, // ENSURE right panel is visible by default
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

    // Force left panel to always be visible, ensure right panel has a valid state
    const panelData: StoredPanelSettings = {
      ...settings,
      isLeftPanelVisible: true, // Override any false values
      isRightPanelVisible: settings.isRightPanelVisible ?? true, // Default to true if undefined
      version: PANEL_VERSION,
      timestamp: Date.now()
    };
    
    localStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify(panelData));
    console.log('💾 Panel settings saved to localStorage:', {
      rightPanelVisible: panelData.isRightPanelVisible,
      version: panelData.version
    });
  } catch (error) {
    console.warn('❌ Failed to save panel settings to localStorage:', error);
  }
};

export const loadPanelSettingsFromStorage = (): Omit<StoredPanelSettings, 'version' | 'timestamp'> => {
  try {
    const stored = localStorage.getItem(PANEL_STORAGE_KEY);
    
    if (!stored) {
      console.log('🆕 No stored panel settings found, using defaults (Properties Panel will be visible)');
      return DEFAULT_PANEL_SETTINGS;
    }

    let panelData: StoredPanelSettings;
    try {
      panelData = JSON.parse(stored);
    } catch (parseError) {
      console.warn('🔧 Corrupted panel settings detected, resetting to defaults');
      localStorage.removeItem(PANEL_STORAGE_KEY);
      return DEFAULT_PANEL_SETTINGS;
    }
    
    // Handle version migration or validation failure
    if (panelData.version !== PANEL_VERSION || !validatePanelSettings(panelData)) {
      console.log(`🔄 Migrating panel settings from ${panelData.version || 'unknown'} to ${PANEL_VERSION}`);
      
      // Clear old/corrupted storage
      localStorage.removeItem('langcanvas_panel_widths');
      localStorage.removeItem(PANEL_STORAGE_KEY);
      
      // For existing users, try to preserve their right panel preference if it was explicitly set
      const preservedRightPanelVisible = panelData.isRightPanelVisible !== undefined 
        ? panelData.isRightPanelVisible 
        : true; // Default to visible for safety
      
      return {
        ...DEFAULT_PANEL_SETTINGS,
        isRightPanelVisible: preservedRightPanelVisible
      };
    }

    console.log('📂 Panel settings loaded from localStorage:', {
      rightPanelVisible: panelData.isRightPanelVisible,
      version: panelData.version
    });

    return {
      isLeftPanelVisible: true, // Always force to true, regardless of stored value
      isLeftPanelExpanded: panelData.isLeftPanelExpanded ?? true,
      isRightPanelVisible: panelData.isRightPanelVisible ?? true, // Force default to true if missing
      isRightPanelExpanded: panelData.isRightPanelExpanded ?? true,
      leftPanelWidth: panelData.leftPanelWidth || DEFAULT_PANEL_SETTINGS.leftPanelWidth,
      rightPanelWidth: panelData.rightPanelWidth || DEFAULT_PANEL_SETTINGS.rightPanelWidth
    };
  } catch (error) {
    console.warn('❌ Failed to load panel settings from localStorage, using defaults:', error);
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
