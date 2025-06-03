
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Upload, 
  File, 
  Code,
  Menu,
  X
} from 'lucide-react';

interface ToolbarProps {
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
  onNewProject: () => void;
  onImport: () => void;
  onExport: () => void;
  onCodePreview: () => void;
  hasNodes: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  isMobileMenuOpen,
  onMobileMenuToggle,
  onNewProject,
  onImport,
  onExport,
  onCodePreview,
  hasNodes
}) => {
  return (
    <header className="bg-white border-b border-gray-200 px-2 sm:px-4 py-2 flex items-center justify-between shadow-sm">
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
        
        <h1 className="text-base sm:text-lg font-semibold text-gray-800 mr-2 sm:mr-4">LangCanvas</h1>
        
        <div className="hidden sm:flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onNewProject}
            className="text-gray-600 hover:text-gray-800 touch-manipulation"
            style={{ minHeight: '44px' }}
          >
            <File className="w-4 h-4 mr-1" />
            <span className="hidden md:inline">New</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onImport}
            className="text-gray-600 hover:text-gray-800 touch-manipulation"
            style={{ minHeight: '44px' }}
          >
            <Upload className="w-4 h-4 mr-1" />
            <span className="hidden md:inline">Import</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onExport}
            className="text-gray-600 hover:text-gray-800 touch-manipulation"
            disabled={!hasNodes}
            style={{ minHeight: '44px' }}
          >
            <Download className="w-4 h-4 mr-1" />
            <span className="hidden md:inline">Export</span>
          </Button>
        </div>
      </div>
      
      <div className="flex items-center space-x-1">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onCodePreview}
          className="text-gray-600 hover:text-gray-800 touch-manipulation"
          disabled={!hasNodes}
          title="Show generated code (read-only)"
          style={{ minHeight: '44px' }}
        >
          <Code className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Preview</span>
        </Button>
      </div>
    </header>
  );
};

export default Toolbar;
