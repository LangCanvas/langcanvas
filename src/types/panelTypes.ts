
export interface PanelDimensions {
  width: number;
  height: number;
}

export interface ResizablePanelState {
  isResizing: boolean;
  startWidth: number;
  currentWidth: number;
}

export type PanelBreakpoint = 'icon-only' | 'ultra-compact' | 'compact' | 'standard' | 'wide';

export interface PanelLayoutConfig {
  showSearch: boolean;
  showCategories: boolean;
  showDescriptions: boolean;
  compactMode: boolean;
  iconSize: 'small' | 'medium' | 'large';
  textSize: 'xs' | 'sm' | 'base';
}
