
import React from 'react';
import { Button } from '@/components/ui/button';
import { File, Upload, Download, X } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNewProject: () => void;
  onImport: () => void;
  onExport: () => void;
  onPanelToggle: (panel: 'palette' | 'properties') => void;
  hasNodes: boolean;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  onNewProject,
  onImport,
  onExport,
  onPanelToggle,
  hasNodes
}) => {
  if (!isOpen) return null;

  const handlePanelToggle = (panel: 'palette' | 'properties') => {
    onPanelToggle(panel);
    onClose();
  };

  return (
    <div 
      className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" 
      onClick={onClose}
      style={{ touchAction: 'none' }}
    >
      <div 
        className="absolute left-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="touch-manipulation"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-4 space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start touch-manipulation"
            onClick={onNewProject}
            style={{ minHeight: '44px' }}
          >
            <File className="w-4 h-4 mr-2" />
            New Project
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start touch-manipulation"
            onClick={onImport}
            style={{ minHeight: '44px' }}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start touch-manipulation"
            onClick={onExport}
            style={{ minHeight: '44px' }}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <div className="border-t border-gray-200 mt-4 pt-4">
            <Button 
              variant="ghost" 
              className="w-full justify-start touch-manipulation"
              onClick={() => handlePanelToggle('palette')}
              style={{ minHeight: '44px' }}
            >
              Node Palette
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start touch-manipulation"
              onClick={() => handlePanelToggle('properties')}
              style={{ minHeight: '44px' }}
            >
              Properties
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
