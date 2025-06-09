
import React from 'react';
import { Button } from '@/components/ui/button';
import { PanelLeft, PanelLeftClose, PanelRight, PanelRightClose } from 'lucide-react';

interface ToolbarPanelTogglesProps {
  isLeftPanelVisible: boolean;
  isLeftPanelExpanded: boolean;
  isRightPanelVisible: boolean;
  isRightPanelExpanded: boolean;
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
}

const ToolbarPanelToggles: React.FC<ToolbarPanelTogglesProps> = ({
  isLeftPanelVisible,
  isLeftPanelExpanded,
  isRightPanelVisible,
  isRightPanelExpanded,
  onToggleLeftPanel,
  onToggleRightPanel
}) => {
  console.log("🔘 ToolbarPanelToggles RENDER - Right panel:", { isRightPanelVisible, isRightPanelExpanded });

  const handleRightPanelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("🔘 RIGHT PANEL BUTTON CLICKED! Current state:", { isRightPanelVisible, isRightPanelExpanded });
    onToggleRightPanel();
    console.log("🔘 RIGHT PANEL onToggleRightPanel called");
  };

  const handleLeftPanelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("🔘 LEFT PANEL BUTTON CLICKED! Current state:", { isLeftPanelVisible, isLeftPanelExpanded });
    onToggleLeftPanel();
    console.log("🔘 LEFT PANEL onToggleLeftPanel called");
  };

  return (
    <>
      {/* Left Panel Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="hidden lg:flex text-gray-600 hover:text-gray-800 hover:bg-yellow-100 touch-manipulation"
        onClick={handleLeftPanelClick}
        style={{ minHeight: '44px', minWidth: '44px' }}
        title={isLeftPanelVisible && isLeftPanelExpanded ? 'Collapse Node Palette' : 'Show Node Palette'}
      >
        {isLeftPanelVisible && isLeftPanelExpanded ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
      </Button>

      {/* Right Panel Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="hidden lg:flex text-gray-600 hover:text-gray-800 hover:bg-blue-100 touch-manipulation"
        onClick={handleRightPanelClick}
        style={{ minHeight: '44px', minWidth: '44px' }}
        title={isRightPanelVisible && isRightPanelExpanded ? 'Collapse Properties Panel' : 'Show Properties Panel'}
      >
        {isRightPanelVisible && isRightPanelExpanded ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
      </Button>
    </>
  );
};

export default ToolbarPanelToggles;
