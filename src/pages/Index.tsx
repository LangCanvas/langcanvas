
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Upload, 
  File, 
  Code,
  Menu,
  X
} from 'lucide-react';
import NodePalette from '../components/NodePalette';
import Canvas from '../components/Canvas';
import PropertiesPanel from '../components/PropertiesPanel';
import { useNodes } from '../hooks/useNodes';
import { useEdges } from '../hooks/useEdges';

const Index = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'palette' | 'properties'>('palette');
  
  const { 
    nodes, 
    selectedNode, 
    selectedNodeId, 
    addNode, 
    updateNodePosition, 
    updateNodeProperties,
    deleteNode, 
    selectNode 
  } = useNodes();

  const {
    edges,
    selectedEdge,
    selectedEdgeId,
    addEdge,
    updateEdgeProperties,
    deleteEdge,
    deleteEdgesForNode,
    selectEdge,
    canCreateEdge,
    getNodeOutgoingEdges
  } = useEdges();

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

  const handleDeleteNode = (nodeId: string) => {
    deleteEdgesForNode(nodeId);
    deleteNode(nodeId);
  };

  const handleAddEdge = (sourceNode: any, targetNode: any) => {
    return addEdge(sourceNode, targetNode);
  };

  const nodeOutgoingEdges = selectedNode ? getNodeOutgoingEdges(selectedNode.id) : [];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Toolbar */}
      <header className="bg-white border-b border-gray-200 px-2 sm:px-4 py-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
          
          <h1 className="text-base sm:text-lg font-semibold text-gray-800 mr-2 sm:mr-4">LangCanvas</h1>
          
          <div className="hidden sm:flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleNewProject}
              className="text-gray-600 hover:text-gray-800"
            >
              <File className="w-4 h-4 mr-1" />
              <span className="hidden md:inline">New</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleImport}
              className="text-gray-600 hover:text-gray-800"
            >
              <Upload className="w-4 h-4 mr-1" />
              <span className="hidden md:inline">Import</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleExport}
              className="text-gray-600 hover:text-gray-800"
              disabled={nodes.length === 0}
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
            onClick={handleCodePreview}
            className="text-gray-600 hover:text-gray-800"
            disabled={nodes.length === 0}
            title="Show generated code (read-only)"
          >
            <Code className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Preview</span>
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
                <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-4 space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => {
                  setActivePanel('palette');
                  setIsMobileMenuOpen(false);
                }}
              >
                Node Palette
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => {
                  setActivePanel('properties');
                  setIsMobileMenuOpen(false);
                }}
              >
                Properties
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Left Sidebar - Node Palette */}
        <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col">
          <NodePalette />
        </aside>

        {/* Mobile Panel Overlay */}
        {(activePanel === 'palette' || activePanel === 'properties') && (
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setActivePanel('palette')}>
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-white rounded-t-lg transform transition-transform" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {activePanel === 'palette' ? 'Node Palette' : 'Properties'}
                  </h2>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setActivePanel(activePanel === 'palette' ? 'properties' : 'palette')}
                    >
                      {activePanel === 'palette' ? 'Properties' : 'Palette'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setActivePanel('palette')}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto">
                {activePanel === 'palette' && <NodePalette />}
                {activePanel === 'properties' && (
                  <PropertiesPanel 
                    selectedNode={selectedNode}
                    selectedEdge={selectedEdge}
                    onDeleteNode={handleDeleteNode}
                    onDeleteEdge={deleteEdge}
                    onUpdateNodeProperties={updateNodeProperties}
                    onUpdateEdgeProperties={updateEdgeProperties}
                    allNodes={nodes}
                    nodeOutgoingEdges={nodeOutgoingEdges}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Canvas Area */}
        <main className="flex-1 relative overflow-auto">
          <Canvas
            nodes={nodes}
            edges={edges}
            selectedNodeId={selectedNodeId}
            selectedEdgeId={selectedEdgeId}
            onAddNode={addNode}
            onSelectNode={selectNode}
            onSelectEdge={selectEdge}
            onMoveNode={updateNodePosition}
            onDeleteNode={handleDeleteNode}
            onDeleteEdge={deleteEdge}
            onAddEdge={handleAddEdge}
            canCreateEdge={canCreateEdge}
          />
        </main>

        {/* Desktop Right Sidebar - Properties Panel */}
        <aside className="hidden lg:flex w-80 bg-white border-l border-gray-200 flex-col">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-700">Properties</h2>
          </div>
          <PropertiesPanel 
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            onDeleteNode={handleDeleteNode}
            onDeleteEdge={deleteEdge}
            onUpdateNodeProperties={updateNodeProperties}
            onUpdateEdgeProperties={updateEdgeProperties}
            allNodes={nodes}
            nodeOutgoingEdges={nodeOutgoingEdges}
          />
        </aside>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden bg-white border-t border-gray-200 p-2">
        <div className="flex justify-around">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setActivePanel('palette')}
            className="flex flex-col items-center space-y-1"
          >
            <Menu className="w-4 h-4" />
            <span className="text-xs">Palette</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setActivePanel('properties')}
            className="flex flex-col items-center space-y-1"
          >
            <File className="w-4 h-4" />
            <span className="text-xs">Properties</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleCodePreview}
            disabled={nodes.length === 0}
            className="flex flex-col items-center space-y-1"
          >
            <Code className="w-4 h-4" />
            <span className="text-xs">Code</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
