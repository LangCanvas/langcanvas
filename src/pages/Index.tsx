
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Wrench, 
  GitBranch, 
  Square, 
  Download, 
  Upload, 
  File, 
  Code,
  Menu
} from 'lucide-react';

const Index = () => {
  const handleNewProject = () => {
    console.log("New project - not implemented yet");
  };

  const handleImport = () => {
    console.log("Import JSON - not implemented yet");
  };

  const handleExport = () => {
    console.log("Export JSON - not implemented yet");
  };

  const handleCodePreview = () => {
    console.log("Code preview - not implemented yet");
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Toolbar */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-1">
          <h1 className="text-lg font-semibold text-gray-800 mr-4">LangCanvas</h1>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleNewProject}
            className="text-gray-600 hover:text-gray-800"
          >
            <File className="w-4 h-4 mr-1" />
            New
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleImport}
            className="text-gray-600 hover:text-gray-800"
          >
            <Upload className="w-4 h-4 mr-1" />
            Import
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleExport}
            className="text-gray-600 hover:text-gray-800"
            disabled
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCodePreview}
            className="text-gray-600 hover:text-gray-800"
            disabled
            title="Show generated code (read-only)"
          >
            <Code className="w-4 h-4 mr-1" />
            Preview Code
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Node Palette */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-700 mb-3">Nodes</h2>
            <div className="space-y-2">
              <div 
                className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                draggable="true"
                title="Drag to canvas to add a start node"
              >
                <Play className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">Start</span>
              </div>
              
              <div 
                className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                draggable="true"
                title="Drag to canvas to add a tool node"
              >
                <Wrench className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">Tool</span>
              </div>
              
              <div 
                className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                draggable="true"
                title="Drag to canvas to add a condition node"
              >
                <GitBranch className="w-5 h-5 text-orange-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">Condition</span>
              </div>
              
              <div 
                className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                draggable="true"
                title="Drag to canvas to add an end node"
              >
                <Square className="w-5 h-5 text-red-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">End</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Canvas Area */}
        <main className="flex-1 relative overflow-auto">
          <div 
            id="canvas" 
            className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 relative"
            style={{
              backgroundImage: `
                radial-gradient(circle, #e5e7eb 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="mb-2">
                  <Menu className="w-12 h-12 mx-auto mb-4 opacity-30" />
                </div>
                <p className="text-lg font-medium mb-1">Welcome to LangCanvas</p>
                <p className="text-sm">Drag nodes from the palette to start building your graph</p>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Properties Panel */}
        <aside className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-700">Properties</h2>
          </div>
          <div id="properties" className="flex-1 p-4">
            <div className="flex items-center justify-center h-full text-center text-gray-400">
              <div>
                <div className="mb-2">
                  <Code className="w-8 h-8 mx-auto mb-3 opacity-30" />
                </div>
                <p className="text-sm">Select a node to edit its properties</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Index;
