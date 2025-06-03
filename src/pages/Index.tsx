
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Upload, 
  File, 
  Code
} from 'lucide-react';
import NodePalette from '../components/NodePalette';
import Canvas from '../components/Canvas';
import PropertiesPanel from '../components/PropertiesPanel';
import { useNodes } from '../hooks/useNodes';
import { useEdges } from '../hooks/useEdges';

const Index = () => {
  const { 
    nodes, 
    selectedNode, 
    selectedNodeId, 
    addNode, 
    updateNodePosition, 
    deleteNode, 
    selectNode 
  } = useNodes();

  const {
    edges,
    selectedEdge,
    selectedEdgeId,
    addEdge,
    deleteEdge,
    deleteEdgesForNode,
    selectEdge,
    canCreateEdge
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
            disabled={nodes.length === 0}
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
            disabled={nodes.length === 0}
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
          <NodePalette />
        </aside>

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

        {/* Right Sidebar - Properties Panel */}
        <aside className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-700">Properties</h2>
          </div>
          <PropertiesPanel 
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            onDeleteNode={handleDeleteNode}
            onDeleteEdge={deleteEdge}
          />
        </aside>
      </div>
    </div>
  );
};

export default Index;
