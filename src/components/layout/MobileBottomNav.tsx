
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, File } from 'lucide-react';
import { ValidationResult } from '../../utils/graphValidation';

interface MobileBottomNavProps {
  onPanelToggle: (panel: 'palette' | 'properties') => void;
  hasNodes: boolean;
  validationResult: ValidationResult;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onPanelToggle,
  hasNodes,
  validationResult
}) => {
  return (
    <div className="lg:hidden bg-white border-t border-gray-200 p-2">
      <div className="flex justify-around">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onPanelToggle('palette')}
          className="flex flex-col items-center space-y-1 touch-manipulation"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          <Menu className="w-4 h-4" />
          <span className="text-xs">Palette</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onPanelToggle('properties')}
          className="flex flex-col items-center space-y-1 touch-manipulation"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          <File className="w-4 h-4" />
          <span className="text-xs">Properties</span>
        </Button>
      </div>
    </div>
  );
};

export default MobileBottomNav;
