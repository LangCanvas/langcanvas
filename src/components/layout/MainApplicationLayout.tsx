import React from 'react';
import Toolbar from './Toolbar';
import MobileMenu from './MobileMenu';
import DesktopSidebar from './DesktopSidebar';
import MainCanvasArea from './MainCanvasArea';
import MobileBottomNav from './MobileBottomNav';
import Footer from './Footer';
import { EnhancedNode } from '../../types/nodeTypes';
import { EnhancedEdge } from '../../types/edgeTypes';
import { ValidationResult } from '../../hooks/useValidation';

interface MainApplicationLayoutProps {
  // UI State
  isMobileMenuOpen: boolean;
  activePanel: 'palette' | 'properties' | null;
  showValidationPanel: boolean;
  
  // Desktop Panel State - updated interface
  isLeftPanelVisible: boolean;
  isLeftPanelExpanded: boolean;
  isRightPanelVisible: boolean;
  isRightPanelExpanded: boolean;
  
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
  onExpandLeftPanel: () => void;
  onExpandRightPanel: () => void;
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
  isLeftPanelExpanded,
  isRightPanelVisible,
  isRightPanelExpanded,
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
  onExpandLeftPanel,
  onExpandRightPanel,
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
  console.log("🏗️ MainApplicationLayout render - Right panel visible:", isRightPanelVisible, "expanded:", isRightPanelExpanded);
  
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
        isLeftPanelVisible={isLeftPanelVisible}
        isLeftPanelExpanded={isLeftPanelExpanded}
        isRightPanelVisible={isRightPanelVisible}
        isRightPanelExpanded={isRightPanelExpanded}
        onToggleLeftPanel={onToggleLeftPanel}
        onToggleRightPanel={onToggleRightPanel}
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
        <DesktopSidebar 
          isVisible={isLeftPanelVisible} 
          isExpanded={isLeftPanelExpanded}
          onExpand={onExpandLeftPanel}
          onToggle={onToggleLeftPanel}
        />
        
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
          isRightPanelExpanded={isRightPanelExpanded}
          onExpandRightPanel={onExpandRightPanel}
          onToggleRightPanel={onToggleRightPanel}
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
