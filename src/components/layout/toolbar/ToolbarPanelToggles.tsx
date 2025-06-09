
import React from 'react';
import { Button } from '@/components/ui/button';
import { PanelLeft, PanelLeftClose, PanelRight, PanelRightClose } from 'lucide-react';

interface ToolbarPanelTogglesProps {
  isLeftPanelVisible: boolean;
  isRightPanelVisible: boolean;
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
}

const ToolbarPanelToggles: React.FC<ToolbarPanelTogglesProps> = ({
  isLeftPanelVisible,
  isRightPanelVisible,
  onToggleLeftPanel,
  onToggleRightPanel
}) => {
  return (
    <>
      {/* Left Panel Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="hidden lg:flex text-gray-600 hover:text-gray-800 touch-manipulation"
        onClick={onToggleLeftPanel}
        style={{ minHeight: '44px', minWidth: '44px' }}
        title={isLeftPanelVisible ? 'Hide Node Palette' : 'Show Node Palette'}
      >
        {isLeftPanelVisible ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
      </Button>

      {/* Right Panel Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="hidden lg:flex text-gray-600 hover:text-gray-800 touch-manipulation"
        onClick={onToggleRightPanel}
        style={{ minHeight: '44px', minWidth: '44px' }}
        title={isRightPanelVisible ? 'Hide Properties Panel' : 'Show Properties Panel'}
      >
        {isRightPanelVisible ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
      </Button>
    </>
  );
};

export default ToolbarPanelToggles;
