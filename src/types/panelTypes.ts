
export interface PanelDimensions {
  width: number;
  height: number;
}

export interface ResizablePanelState {
  isResizing: boolean;
  startWidth: number;
  currentWidth: number;
}

export type PanelBreakpoint = 'small' | 'medium';
export type PanelLayout = 'small' | 'medium'; // Moved from deleted useAdaptivePanelWidths

export interface PanelLayoutConfig {
  showSearch: boolean;
  showCategories: boolean;
  showDescriptions: boolean;
  compactMode: boolean;
  iconSize: 'small' | 'medium' | 'large';
  textSize: 'xs' | 'sm' | 'base';
}
