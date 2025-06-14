
import React from 'react';
import ToolbarBrand from './toolbar/ToolbarBrand';
import ToolbarMenu from './toolbar/ToolbarMenu';
import ToolbarActions from './toolbar/ToolbarActions';
import ToolbarValidation from './toolbar/ToolbarValidation';
import { ValidationResult } from '../../hooks/useValidation';

interface ToolbarProps {
  isMobileMenuOpen: boolean;
  hasNodes: boolean;
  validationResult: ValidationResult;
  isSelecting?: boolean;
  selectedCount?: number;
  isRightPanelVisible?: boolean;
  onMobileMenuToggle: () => void;
  onNewProject: () => void;
  onImport: () => void;
  onExport: () => void;
  onToggleRightPanel?: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  isMobileMenuOpen,
  hasNodes,
  validationResult,
  isSelecting = false,
  selectedCount = 0,
  isRightPanelVisible = true,
  onMobileMenuToggle,
  onNewProject,
  onImport,
  onExport,
  onToggleRightPanel,
}) => {
  return (
    <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 relative z-50">
      <ToolbarBrand />

      <div className="flex items-center gap-3 ml-auto">
        <ToolbarValidation 
          validationResult={validationResult} 
          hasNodes={hasNodes}
        />
        
        <ToolbarActions 
          onNewProject={onNewProject}
          onImport={onImport}
          onExport={onExport}
          isRightPanelVisible={isRightPanelVisible}
          onToggleRightPanel={onToggleRightPanel}
        />
        
        <ToolbarMenu />
      </div>
    </header>
  );
};

export default Toolbar;
