
import { PanelLayout } from '../../hooks/useAdaptivePanelWidths';

export interface LayoutConfig {
  showSearch: boolean;
  showCategories: boolean;
  showDescriptions: boolean;
  showNodeCount: boolean;
  compactItems: boolean;
  iconOnlyItems: boolean;
  maxVisibleNodes: number | null;
}

export const getLayoutConfig = (panelLayout: PanelLayout): LayoutConfig => {
  switch (panelLayout) {
    case 'small':
      return {
        showSearch: false,
        showCategories: false, // Remove categories in small mode as requested
        showDescriptions: false,
        showNodeCount: false,
        compactItems: true,
        iconOnlyItems: true,
        maxVisibleNodes: 8
      };
    case 'medium':
      return {
        showSearch: true,
        showCategories: true,
        showDescriptions: false,
        showNodeCount: true,
        compactItems: false,
        iconOnlyItems: false,
        maxVisibleNodes: null
      };
    default:
      return {
        showSearch: true,
        showCategories: true,
        showDescriptions: false,
        showNodeCount: true,
        compactItems: false,
        iconOnlyItems: false,
        maxVisibleNodes: null
      };
  }
};
