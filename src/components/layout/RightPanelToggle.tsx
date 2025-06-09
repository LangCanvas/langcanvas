
import React from 'react';
import { Button } from '@/components/ui/button';
import { PanelRight, PanelRightClose } from 'lucide-react';

interface RightPanelToggleProps {
  isVisible: boolean;
  onToggle: () => void;
}

const RightPanelToggle: React.FC<RightPanelToggleProps> = ({ isVisible, onToggle }) => {
  return (
    <div className="absolute top-20 right-4 z-20 hidden lg:block">
      <Button
        variant="outline"
        size="sm"
        className="bg-white/95 backdrop-blur-sm shadow-lg border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-gray-900 h-8 w-8 p-0"
        onClick={onToggle}
        title={isVisible ? 'Hide Properties Panel' : 'Show Properties Panel'}
      >
        {isVisible ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
      </Button>
    </div>
  );
};

export default RightPanelToggle;
