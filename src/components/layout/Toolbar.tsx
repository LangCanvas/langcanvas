import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Upload, 
  File,
  Menu,
  X,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { ValidationResult } from '../../utils/graphValidation';

interface ToolbarProps {
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
  onNewProject: () => void;
  onImport: () => void;
  onExport: () => void;
  hasNodes: boolean;
  validationResult?: ValidationResult;
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
  const handleNewClick = () => {
    console.log("🔴 New button clicked in Toolbar");
    console.log("🔴 onNewProject function:", onNewProject);
    try {
      onNewProject();
      console.log("🔴 New button handler executed successfully");
    } catch (error) {
      console.error("🔴 Error in New button handler:", error);
    }
  };

  const handleImportClick = () => {
    console.log("🔴 Import button clicked in Toolbar");
    console.log("🔴 onImport function:", onImport);
    try {
      onImport();
      console.log("🔴 Import button handler executed successfully");
    } catch (error) {
      console.error("🔴 Error in Import button handler:", error);
    }
  };

  const handleExportClick = () => {
    console.log("🔴 Export button clicked in Toolbar");
    console.log("🔴 onExport function:", onExport);
    console.log("🔴 hasNodes:", hasNodes);
    try {
      onExport();
      console.log("🔴 Export button handler executed successfully");
    } catch (error) {
      console.error("🔴 Error in Export button handler:", error);
    }
  };

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
        
        <div className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/655971a4-1644-42d9-984c-106deca1859b.png" 
            alt="LangCanvas" 
            className="w-16 h-16 sm:w-20 sm:h-20"
          />
        </div>
        
        {/* Validation Status Indicator */}
        {validationResult && hasNodes && (
          <div className="hidden sm:flex items-center">
            {validationResult.errorCount > 0 ? (
              <div className="flex items-center text-red-600 text-sm">
                <AlertTriangle className="w-4 h-4 mr-1" />
                <span>{validationResult.errorCount} error{validationResult.errorCount !== 1 ? 's' : ''}</span>
              </div>
            ) : validationResult.warningCount > 0 ? (
              <div className="flex items-center text-orange-600 text-sm">
                <AlertTriangle className="w-4 h-4 mr-1" />
                <span>{validationResult.warningCount} warning{validationResult.warningCount !== 1 ? 's' : ''}</span>
              </div>
            ) : (
              <div className="flex items-center text-green-600 text-sm">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span>Valid</span>
              </div>
            )}
          </div>
        )}
        
        <div className="hidden sm:flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleNewClick}
            className="text-gray-600 hover:text-gray-800 touch-manipulation"
            style={{ minHeight: '44px' }}
          >
            <File className="w-4 h-4 mr-1" />
            <span className="hidden md:inline">New</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleImportClick}
            className="text-gray-600 hover:text-gray-800 touch-manipulation"
            style={{ minHeight: '44px' }}
          >
            <Upload className="w-4 h-4 mr-1" />
            <span className="hidden md:inline">Import</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleExportClick}
            className="text-gray-600 hover:text-gray-800 touch-manipulation"
            style={{ minHeight: '44px' }}
          >
            <Download className="w-4 h-4 mr-1" />
            <span className="hidden md:inline">Export</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Toolbar;
