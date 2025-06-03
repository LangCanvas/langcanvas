
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, File, Code } from 'lucide-react';

interface MobileBottomNavProps {
  onPanelToggle: (panel: 'palette' | 'properties') => void;
  onCodePreview: () => void;
  hasNodes: boolean;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onPanelToggle,
  onCodePreview,
  hasNodes
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
          onClick={onCodePreview}
          disabled={!hasNodes}
          className="flex flex-col items-center space-y-1 touch-manipulation"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          <Code className="w-4 h-4" />
          <span className="text-xs">Code</span>
        </Button>
      </div>
    </div>
  );
};

export default MobileBottomNav;
