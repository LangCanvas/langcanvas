
import React from 'react';
import EnhancedNodePalette from '../palette/EnhancedNodePalette';
import { LeftPanelLayout } from '../../hooks/useLeftPanelState';

interface DesktopSidebarProps {
  isVisible?: boolean;
  isExpanded?: boolean;
  panelWidth?: number;
  panelLayout?: LeftPanelLayout;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ 
  isVisible = true, 
  isExpanded = true,
  panelWidth = 256,
  panelLayout = 'medium'
}) => {
  console.log('🎨 DesktopSidebar - Clean render:', {
    isVisible,
    isExpanded,
    panelWidth,
    panelLayout
  });

  if (!isVisible) {
    return null;
  }

  return (
    <aside 
      className="h-full w-full bg-white flex flex-col"
      style={{ 
        minWidth: `${panelWidth}px`,
        width: `${panelWidth}px`,
        maxWidth: `${panelWidth}px`
      }}
    >
      <div className="p-3 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900 text-sm">
          Node Palette
        </h2>
      </div>
      
      <div className="flex-1 overflow-auto">
        <EnhancedNodePalette 
          onNodeTypeSelect={(type) => {
            const event = new CustomEvent('setPendingCreation', { detail: type });
            window.dispatchEvent(event);
          }}
          isExpanded={isExpanded}
          panelWidth={panelWidth}
          panelLayout={panelLayout}
        />
      </div>
    </aside>
  );
};

export default DesktopSidebar;
