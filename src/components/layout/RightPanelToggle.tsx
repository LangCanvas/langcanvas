
import React from 'react';
import { Button } from '@/components/ui/button';
import { PanelRight, PanelRightClose } from 'lucide-react';

interface RightPanelToggleProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const RightPanelToggle: React.FC<RightPanelToggleProps> = ({ isExpanded, onToggle }) => {
  return (
    <div className="absolute -left-5 top-20 z-20 hidden lg:block">
      <Button
        variant="outline"
        size="sm"
        className="bg-white/95 backdrop-blur-sm shadow-lg border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-gray-900 h-10 w-10 p-0"
        onClick={onToggle}
        title={isExpanded ? 'Collapse Properties Panel' : 'Expand Properties Panel'}
      >
        {isExpanded ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
      </Button>
    </div>
  );
};

export default RightPanelToggle;
