
import React from 'react';
import NodePalette from '../NodePalette';

interface DesktopSidebarProps {
  isVisible?: boolean;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ isVisible = true }) => {
  return (
    <aside 
      className={`hidden lg:flex bg-white border-r border-gray-200 flex-col transition-all duration-300 ease-in-out ${
        isVisible ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'
      }`}
      style={{ 
        overflow: isVisible ? 'visible' : 'hidden',
        opacity: isVisible ? 1 : 0
      }}
    >
      {isVisible && (
        <NodePalette onNodeTypeSelect={(type) => {
          const event = new CustomEvent('setPendingCreation', { detail: type });
          window.dispatchEvent(event);
        }} />
      )}
    </aside>
  );
};

export default DesktopSidebar;
