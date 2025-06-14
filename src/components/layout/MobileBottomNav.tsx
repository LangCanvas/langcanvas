
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, File, Settings } from 'lucide-react';
import { ValidationResult } from '../../hooks/useValidation';

interface MobileBottomNavProps {
  activePanel: 'palette' | 'properties' | 'validation' | 'settings';
  validationResult: ValidationResult;
  onPanelToggle: (panel: 'palette' | 'properties' | 'validation' | 'settings') => void;
  setShowValidationPanel: (show: boolean) => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activePanel,
  validationResult,
  onPanelToggle,
  setShowValidationPanel
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
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onPanelToggle('settings')}
          className="flex flex-col items-center space-y-1 touch-manipulation"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          <Settings className="w-4 h-4" />
          <span className="text-xs">Settings</span>
        </Button>
      </div>
    </div>
  );
};

export default MobileBottomNav;
