
import React from 'react';
import NodePalette from '../NodePalette';
import CollapsedNodePalette from './CollapsedNodePalette';

interface DesktopSidebarProps {
  isVisible?: boolean;
  isExpanded?: boolean;
  onExpand?: () => void;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ 
  isVisible = true, 
  isExpanded = true,
  onExpand
}) => {
  // If not visible at all, don't render anything
  if (!isVisible) {
    return null;
  }

  // Handle collapsed state
  const handleExpand = () => {
    console.log('Expand sidebar requested');
    if (onExpand) {
      onExpand();
    }
  };

  // Show collapsed panel when not expanded
  if (!isExpanded) {
    return <CollapsedNodePalette onExpand={handleExpand} />;
  }

  // Show expanded panel
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out">
      <NodePalette onNodeTypeSelect={(type) => {
        const event = new CustomEvent('setPendingCreation', { detail: type });
        window.dispatchEvent(event);
      }} />
    </aside>
  );
};

export default DesktopSidebar;
