
import React from 'react';
import EnhancedNodePalette from '../palette/EnhancedNodePalette';
import CollapsedNodePalette from './CollapsedNodePalette';
import { PanelLayout } from '../../hooks/useAdaptivePanelWidths';

interface DesktopSidebarProps {
  isVisible?: boolean;
  isExpanded?: boolean;
  panelWidth?: number;
  panelLayout?: PanelLayout;
  onExpand?: () => void;
  onToggle?: () => void;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ 
  isVisible = true, 
  isExpanded = true,
  panelWidth = 256,
  panelLayout = 'standard',
  onExpand,
  onToggle
}) => {
  // If not visible at all, don't render anything
  if (!isVisible) {
    return null;
  }

  // Handle collapsed state
  const handleToggle = () => {
    console.log('Toggle sidebar requested');
    if (onToggle) {
      onToggle();
    } else if (onExpand) {
      onExpand();
    }
  };

  // Show collapsed panel when not expanded or in icon-only mode
  if (!isExpanded || panelLayout === 'icon-only') {
    return (
      <aside className="relative h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out">
        <CollapsedNodePalette onToggle={handleToggle} isExpanded={isExpanded} />
      </aside>
    );
  }

  // Show expanded panel with enhanced palette
  return (
    <aside className="relative h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out">
      <EnhancedNodePalette 
        onNodeTypeSelect={(type) => {
          const event = new CustomEvent('setPendingCreation', { detail: type });
          window.dispatchEvent(event);
        }}
        onToggle={handleToggle}
        isExpanded={isExpanded}
        panelWidth={panelWidth}
        panelLayout={panelLayout}
      />
    </aside>
  );
};

export default DesktopSidebar;
