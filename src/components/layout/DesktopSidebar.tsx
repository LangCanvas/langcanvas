
import React from 'react';
import NodePalette from '../NodePalette';

const DesktopSidebar: React.FC = () => {
  return (
    <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col">
      <NodePalette onNodeTypeSelect={(type) => {
        // This will be handled by the parent component
        const event = new CustomEvent('setPendingCreation', { detail: type });
        window.dispatchEvent(event);
      }} />
    </aside>
  );
};

export default DesktopSidebar;
