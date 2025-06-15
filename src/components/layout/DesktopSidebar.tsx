
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
  console.log('🎨 DesktopSidebar - Render with debug styling:', {
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
      className="h-full w-full bg-cyan-300 border-8 border-cyan-800 flex flex-col"
      style={{ 
        minWidth: `${panelWidth}px`,
        width: `${panelWidth}px`,
        maxWidth: `${panelWidth}px`
      }}
    >
      <div className="p-4 bg-cyan-400 border-b border-cyan-600">
        <h2 className="font-bold text-cyan-900 text-lg">
          🎨 LEFT PANEL VISIBLE!
        </h2>
        <div className="text-cyan-900 text-sm space-y-1">
          <div>Width: {panelWidth}px</div>
          <div>Layout: {panelLayout}</div>
        </div>
      </div>
      
      <div className="flex-1 bg-cyan-200 overflow-auto">
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
