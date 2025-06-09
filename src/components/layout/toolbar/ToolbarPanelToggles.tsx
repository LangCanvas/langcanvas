
import React from 'react';
import { Button } from '@/components/ui/button';
import { PanelLeft, PanelLeftClose } from 'lucide-react';

interface ToolbarPanelTogglesProps {
  isLeftPanelVisible: boolean;
  isLeftPanelExpanded: boolean;
  onToggleLeftPanel: () => void;
}

const ToolbarPanelToggles: React.FC<ToolbarPanelTogglesProps> = ({
  isLeftPanelVisible,
  isLeftPanelExpanded,
  onToggleLeftPanel
}) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="hidden lg:flex text-gray-600 hover:text-gray-800 hover:bg-yellow-100"
      onClick={onToggleLeftPanel}
      title={isLeftPanelVisible && isLeftPanelExpanded ? 'Collapse Node Palette' : 'Show Node Palette'}
    >
      {isLeftPanelVisible && isLeftPanelExpanded ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
    </Button>
  );
};

export default ToolbarPanelToggles;
