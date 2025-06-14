
import React from 'react';
import EnhancedNodePalette from '../palette/EnhancedNodePalette';
import { PanelLayout } from '../../hooks/useAdaptivePanelWidths';

interface DesktopSidebarProps {
  isVisible?: boolean;
  isExpanded?: boolean;
  panelWidth?: number;
  panelLayout?: PanelLayout;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ 
  isVisible = true, 
  isExpanded = true,
  panelWidth = 256,
  panelLayout = 'medium'
}) => {
  // If not visible at all, don't render anything
  if (!isVisible) {
    return null;
  }

  // Always show expanded panel with enhanced palette (no collapsed state)
  return (
    <aside className="relative h-full bg-white border-r border-gray-200 flex flex-col">
      <EnhancedNodePalette 
        onNodeTypeSelect={(type) => {
          const event = new CustomEvent('setPendingCreation', { detail: type });
          window.dispatchEvent(event);
        }}
        isExpanded={isExpanded}
        panelWidth={panelWidth}
        panelLayout={panelLayout}
      />
    </aside>
  );
};

export default DesktopSidebar;
