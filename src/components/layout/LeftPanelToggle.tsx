
import React from 'react';
import { Button } from '@/components/ui/button';
import { PanelLeft, PanelLeftClose } from 'lucide-react';

interface LeftPanelToggleProps {
  isVisible: boolean;
  onToggle: () => void;
}

const LeftPanelToggle: React.FC<LeftPanelToggleProps> = ({ isVisible, onToggle }) => {
  return (
    <div className="absolute top-20 left-4 z-20 hidden lg:block">
      <Button
        variant="outline"
        size="sm"
        className="bg-white/95 backdrop-blur-sm shadow-lg border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-gray-900 h-8 w-8 p-0"
        onClick={onToggle}
        title={isVisible ? 'Hide Node Palette' : 'Show Node Palette'}
      >
        {isVisible ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
      </Button>
    </div>
  );
};

export default LeftPanelToggle;
