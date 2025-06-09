
import React from 'react';
import NodePalette from '../NodePalette';
import CollapsedNodePalette from './CollapsedNodePalette';

interface DesktopSidebarProps {
  isVisible?: boolean;
  isExpanded?: boolean;
  onExpand?: () => void;
  onToggle?: () => void;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ 
  isVisible = true, 
  isExpanded = true,
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

  // Show collapsed panel when not expanded
  if (!isExpanded) {
    return (
      <aside className="relative w-14 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out">
        <CollapsedNodePalette onToggle={handleToggle} isExpanded={isExpanded} />
      </aside>
    );
  }

  // Show expanded panel
  return (
    <aside className="relative w-64 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out">
      <NodePalette 
        onNodeTypeSelect={(type) => {
          const event = new CustomEvent('setPendingCreation', { detail: type });
          window.dispatchEvent(event);
        }}
        onToggle={handleToggle}
        isExpanded={isExpanded}
      />
    </aside>
  );
};

export default DesktopSidebar;
