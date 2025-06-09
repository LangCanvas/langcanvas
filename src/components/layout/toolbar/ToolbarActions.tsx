
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, File } from 'lucide-react';

interface ToolbarActionsProps {
  onNewProject: () => void;
  onImport: () => void;
  onExport: () => void;
}

const ToolbarActions: React.FC<ToolbarActionsProps> = ({
  onNewProject,
  onImport,
  onExport
}) => {
  const handleNewClick = () => {
    console.log("🔴 New button clicked in ToolbarActions");
    try {
      onNewProject();
      console.log("🔴 New button handler executed successfully");
    } catch (error) {
      console.error("🔴 Error in New button handler:", error);
    }
  };

  const handleImportClick = () => {
    console.log("🔴 Import button clicked in ToolbarActions");
    try {
      onImport();
      console.log("🔴 Import button handler executed successfully");
    } catch (error) {
      console.error("🔴 Error in Import button handler:", error);
    }
  };

  const handleExportClick = () => {
    console.log("🔴 Export button clicked in ToolbarActions");
    try {
      onExport();
      console.log("🔴 Export button handler executed successfully");
    } catch (error) {
      console.error("🔴 Error in Export button handler:", error);
    }
  };

  return (
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
  );
};

export default ToolbarActions;
