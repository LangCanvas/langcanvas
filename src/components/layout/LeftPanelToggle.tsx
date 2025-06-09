
import React from 'react';
import { Button } from '@/components/ui/button';
import { PanelLeft, PanelLeftClose } from 'lucide-react';

interface LeftPanelToggleProps {
  isVisible: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

const LeftPanelToggle: React.FC<LeftPanelToggleProps> = ({ isVisible, isExpanded, onToggle }) => {
  // Don't show toggle if panel is completely hidden
  if (!isVisible) {
    return null;
  }

  // Position the button based on panel state
  const buttonPosition = isExpanded ? 'left-64' : 'left-14';
  
  return (
    <div className={`absolute top-20 z-20 hidden lg:block transition-all duration-300 ease-in-out ${buttonPosition}`}>
      <Button
        variant="outline"
        size="sm"
        className="bg-white/95 backdrop-blur-sm shadow-lg border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-gray-900 h-10 w-10 p-0 -mr-5"
        onClick={onToggle}
        title={isExpanded ? 'Collapse Node Palette' : 'Expand Node Palette'}
      >
        {isExpanded ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
      </Button>
    </div>
  );
};

export default LeftPanelToggle;
