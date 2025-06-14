
import { PanelLayout } from '../../hooks/useAdaptivePanelWidths';

export interface LayoutConfig {
  showSearch: boolean;
  showCategories: boolean;
  showDescriptions: boolean;
  showNodeCount: boolean;
  compactItems: boolean;
  compactCategories: boolean;
  iconOnlyCategories: boolean;
  iconOnlyItems: boolean;
  maxVisibleNodes: number | null;
}

export const getLayoutConfig = (panelLayout: PanelLayout): LayoutConfig => {
  switch (panelLayout) {
    case 'icon-only':
      return {
        showSearch: false,
        showCategories: true,
        showDescriptions: false,
        showNodeCount: false,
        compactItems: true,
        compactCategories: false,
        iconOnlyCategories: true,
        iconOnlyItems: true,
        maxVisibleNodes: 6
      };
    case 'ultra-compact':
      return {
        showSearch: false,
        showCategories: true,
        showDescriptions: false,
        showNodeCount: false,
        compactItems: true,
        compactCategories: true,
        iconOnlyCategories: false,
        iconOnlyItems: false,
        maxVisibleNodes: 8
      };
    case 'compact':
      return {
        showSearch: true,
        showCategories: true,
        showDescriptions: false,
        showNodeCount: false,
        compactItems: true,
        compactCategories: false,
        iconOnlyCategories: false,
        iconOnlyItems: false,
        maxVisibleNodes: 12
      };
    case 'standard':
      return {
        showSearch: true,
        showCategories: true,
        showDescriptions: false,
        showNodeCount: true,
        compactItems: false,
        compactCategories: false,
        iconOnlyCategories: false,
        iconOnlyItems: false,
        maxVisibleNodes: null
      };
    case 'wide':
      return {
        showSearch: true,
        showCategories: true,
        showDescriptions: true,
        showNodeCount: true,
        compactItems: false,
        compactCategories: false,
        iconOnlyCategories: false,
        iconOnlyItems: false,
        maxVisibleNodes: null
      };
    default:
      return {
        showSearch: true,
        showCategories: true,
        showDescriptions: true,
        showNodeCount: true,
        compactItems: false,
        compactCategories: false,
        iconOnlyCategories: false,
        iconOnlyItems: false,
        maxVisibleNodes: null
      };
  }
};
