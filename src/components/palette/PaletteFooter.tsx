
import React from 'react';
import { PanelLayout } from '../../hooks/useAdaptivePanelWidths';
import { LayoutConfig } from './PaletteLayoutConfig';

interface PaletteFooterProps {
  panelLayout: PanelLayout;
  layoutConfig: LayoutConfig;
  filteredNodesCount: number;
  maxVisibleNodes: number | null;
  totalDisplayed: number;
}

const PaletteFooter: React.FC<PaletteFooterProps> = ({
  panelLayout,
  layoutConfig,
  filteredNodesCount,
  maxVisibleNodes,
  totalDisplayed
}) => {
  return (
    <>
      {maxVisibleNodes && filteredNodesCount > maxVisibleNodes && (
        <div className="text-xs text-gray-500 text-center">
          +{filteredNodesCount - maxVisibleNodes} more
        </div>
      )}

      {panelLayout !== 'small' && (
        <div className="mt-4 text-xs text-gray-500">
          <p className="hidden lg:block">Drag nodes to the canvas to create them</p>
          <p className="lg:hidden">Tap a node type, then tap on the canvas to place it</p>
          {layoutConfig.showNodeCount && filteredNodesCount > 0 && (
            <p className="mt-1">
              {filteredNodesCount} node{filteredNodesCount !== 1 ? 's' : ''} available
            </p>
          )}
        </div>
      )}
    </>
  );
};

export default PaletteFooter;
