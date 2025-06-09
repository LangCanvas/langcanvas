
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { ValidationResult } from '../../utils/graphValidation';
import ToolbarBrand from './toolbar/ToolbarBrand';
import ToolbarValidation from './toolbar/ToolbarValidation';
import ToolbarActions from './toolbar/ToolbarActions';
import ToolbarMenu from './toolbar/ToolbarMenu';

interface ToolbarProps {
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
  onNewProject: () => void;
  onImport: () => void;
  onExport: () => void;
  hasNodes: boolean;
  validationResult?: ValidationResult;
  isLeftPanelVisible?: boolean;
  isRightPanelVisible?: boolean;
  onToggleLeftPanel?: () => void;
  onToggleRightPanel?: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  isMobileMenuOpen,
  onMobileMenuToggle,
  onNewProject,
  onImport,
  onExport,
  hasNodes,
  validationResult
}) => {
  return (
    <header className="bg-gray-100 border-b border-gray-200 px-2 sm:px-4 py-2 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden touch-manipulation"
          onClick={onMobileMenuToggle}
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
        
        <ToolbarBrand />
        
        <ToolbarValidation 
          validationResult={validationResult}
          hasNodes={hasNodes}
        />
        
        <ToolbarActions 
          onNewProject={onNewProject}
          onImport={onImport}
          onExport={onExport}
        />
      </div>

      <div className="flex items-center space-x-2">
        <ToolbarMenu />
      </div>
    </header>
  );
};

export default Toolbar;
