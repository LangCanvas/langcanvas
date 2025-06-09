
import React from 'react';
import ToolbarBrand from './toolbar/ToolbarBrand';
import ToolbarMenu from './toolbar/ToolbarMenu';
import ToolbarActions from './toolbar/ToolbarActions';
import ToolbarValidation from './toolbar/ToolbarValidation';
import ToolbarPanelToggles from './toolbar/ToolbarPanelToggles';
import { ValidationResult } from '../../hooks/useValidation';

interface ToolbarProps {
  isMobileMenuOpen: boolean;
  hasNodes: boolean;
  validationResult: ValidationResult;
  isLeftPanelVisible: boolean;
  isLeftPanelExpanded: boolean;
  isRightPanelVisible: boolean;
  isRightPanelExpanded: boolean;
  onMobileMenuToggle: () => void;
  onNewProject: () => void;
  onImport: () => void;
  onExport: () => void;
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  isMobileMenuOpen,
  hasNodes,
  validationResult,
  isLeftPanelVisible,
  isLeftPanelExpanded,
  isRightPanelVisible,
  isRightPanelExpanded,
  onMobileMenuToggle,
  onNewProject,
  onImport,
  onExport,
  onToggleLeftPanel,
  onToggleRightPanel,
}) => {
  return (
    <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 relative z-50">
      <ToolbarBrand />
      
      <ToolbarMenu />

      <div className="flex items-center gap-2 ml-auto">
        <ToolbarPanelToggles
          isLeftPanelVisible={isLeftPanelVisible}
          isLeftPanelExpanded={isLeftPanelExpanded}
          isRightPanelVisible={isRightPanelVisible}
          isRightPanelExpanded={isRightPanelExpanded}
          onToggleLeftPanel={onToggleLeftPanel}
          onToggleRightPanel={onToggleRightPanel}
        />
        
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
    </header>
  );
};

export default Toolbar;
