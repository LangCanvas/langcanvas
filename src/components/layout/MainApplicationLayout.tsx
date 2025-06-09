
import React from 'react';
import Toolbar from './Toolbar';
import MobileMenu from './MobileMenu';
import DesktopSidebar from './DesktopSidebar';
import MainCanvasArea from './MainCanvasArea';
import MobileBottomNav from './MobileBottomNav';
import Footer from './Footer';
import LeftPanelToggle from './LeftPanelToggle';
import RightPanelToggle from './RightPanelToggle';
import { EnhancedNode } from '../../types/nodeTypes';
import { EnhancedEdge } from '../../types/edgeTypes';
import { ValidationResult } from '../../hooks/useValidation';

interface MainApplicationLayoutProps {
  // UI State
  isMobileMenuOpen: boolean;
  activePanel: 'palette' | 'properties' | null;
  showValidationPanel: boolean;
  
  // Desktop Panel State
  isLeftPanelVisible: boolean;
  isRightPanelVisible: boolean;
  
  // Data
  nodes: EnhancedNode[];
  edges: EnhancedEdge[];
  selectedNode: EnhancedNode | null;
  selectedEdge: EnhancedEdge | null;
  validationResult: ValidationResult;
  
  // Actions
  onMobileMenuToggle: () => void;
  onPanelToggle: (panel: 'palette' | 'properties') => void;
  closePanels: () => void;
  setShowValidationPanel: (show: boolean) => void;
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
  switchToPropertiesPanel: () => void;
  
  // Workflow Actions
  onNewProject: () => void;
  onImport: () => void;
  onExport: () => void;
  
  // Node/Edge Actions
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  onUpdateNodeProperties: (nodeId: string, updates: Partial<EnhancedNode>) => void;
  onUpdateEdgeProperties: (edgeId: string, updates: Partial<EnhancedEdge>) => void;
  
  // Validation
  validatePriorityConflicts?: (nodeId: string, priority: number, currentEdgeId?: string) => { hasConflict: boolean; conflictingEdges: EnhancedEdge[] };
  
  // Other props
  children: React.ReactNode;
}

const MainApplicationLayout: React.FC<MainApplicationLayoutProps> = ({
  isMobileMenuOpen,
  activePanel,
  showValidationPanel,
  isLeftPanelVisible,
  isRightPanelVisible,
  nodes,
  edges,
  selectedNode,
  selectedEdge,
  validationResult,
  onMobileMenuToggle,
  onPanelToggle,
  closePanels,
  setShowValidationPanel,
  onToggleLeftPanel,
  onToggleRightPanel,
  switchToPropertiesPanel,
  onNewProject,
  onImport,
  onExport,
  onDeleteNode,
  onDeleteEdge,
  onUpdateNodeProperties,
  onUpdateEdgeProperties,
  validatePriorityConflicts,
  children
}) => {
  return (
    <div className="h-screen flex flex-col bg-gray-50 relative">
      <Toolbar
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={onMobileMenuToggle}
        onNewProject={onNewProject}
        onImport={onImport}
        onExport={onExport}
        hasNodes={nodes.length > 0}
        validationResult={validationResult}
      />

      <LeftPanelToggle
        isVisible={isLeftPanelVisible}
        onToggle={onToggleLeftPanel}
      />

      <RightPanelToggle
        isVisible={isRightPanelVisible}
        onToggle={onToggleRightPanel}
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
        <DesktopSidebar isVisible={isLeftPanelVisible} />
        
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
          validatePriorityConflicts={validatePriorityConflicts}
          isRightPanelVisible={isRightPanelVisible}
          switchToPropertiesPanel={switchToPropertiesPanel}
        >
          {children}
        </MainCanvasArea>
      </div>

      <MobileBottomNav
        onPanelToggle={onPanelToggle}
        hasNodes={nodes.length > 0}
        validationResult={validationResult}
      />

      <Footer />
    </div>
  );
};

export default MainApplicationLayout;
