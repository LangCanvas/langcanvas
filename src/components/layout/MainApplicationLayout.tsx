import React from 'react';
import Toolbar from './Toolbar';
import MobileMenu from './MobileMenu';
import DesktopSidebar from './DesktopSidebar';
import MainCanvasArea from './MainCanvasArea';
import MobileBottomNav from './MobileBottomNav';
import { EnhancedNode } from '../../types/nodeTypes';
import { EnhancedEdge } from '../../types/edgeTypes';
import { ValidationResult } from '../../hooks/useValidation';

interface MainApplicationLayoutProps {
  // UI State
  isMobileMenuOpen: boolean;
  activePanel: string | null;
  showValidationPanel: boolean;
  
  // Data
  nodes: EnhancedNode[];
  edges: EnhancedEdge[];
  selectedNode: EnhancedNode | null;
  selectedEdge: EnhancedEdge | null;
  validationResult: ValidationResult;
  
  // Actions
  onMobileMenuToggle: () => void;
  onPanelToggle: (panel: string) => void;
  closePanels: () => void;
  setShowValidationPanel: (show: boolean) => void;
  
  // Workflow Actions
  onNewProject: () => void;
  onImport: () => void;
  onExport: () => void;
  
  // Node/Edge Actions
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  onUpdateNodeProperties: (nodeId: string, updates: Partial<EnhancedNode>) => void;
  onUpdateEdgeProperties: (edgeId: string, updates: Partial<EnhancedEdge>) => void;
  
  // Other props
  children: React.ReactNode;
}

const MainApplicationLayout: React.FC<MainApplicationLayoutProps> = ({
  isMobileMenuOpen,
  activePanel,
  showValidationPanel,
  nodes,
  edges,
  selectedNode,
  selectedEdge,
  validationResult,
  onMobileMenuToggle,
  onPanelToggle,
  closePanels,
  setShowValidationPanel,
  onNewProject,
  onImport,
  onExport,
  onDeleteNode,
  onDeleteEdge,
  onUpdateNodeProperties,
  onUpdateEdgeProperties,
  children
}) => {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Toolbar
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={onMobileMenuToggle}
        onNewProject={onNewProject}
        onImport={onImport}
        onExport={onExport}
        hasNodes={nodes.length > 0}
        validationResult={validationResult}
      />

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={closePanels}
        onNewProject={onNewProject}
        onImport={onImport}
        onExport={onExport}
        onPanelToggle={onPanelToggle}
        hasNodes={nodes.length > 0}
      />

      <div className="flex-1 flex overflow-hidden">
        <DesktopSidebar />
        
        <MainCanvasArea
          activePanel={activePanel}
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          onClose={closePanels}
          onPanelToggle={onPanelToggle}
          onDeleteNode={onDeleteNode}
          onDeleteEdge={onDeleteEdge}
          onUpdateNodeProperties={onUpdateNodeProperties}
          onUpdateEdgeProperties={onUpdateEdgeProperties}
          allNodes={nodes}
          allEdges={edges}
          validationResult={validationResult}
          showValidationPanel={showValidationPanel}
          setShowValidationPanel={setShowValidationPanel}
        >
          {children}
        </MainCanvasArea>
      </div>

      <MobileBottomNav
        onPanelToggle={onPanelToggle}
        hasNodes={nodes.length > 0}
        validationResult={validationResult}
      />
    </div>
  );
};

export default MainApplicationLayout;
