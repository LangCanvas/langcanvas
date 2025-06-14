
import React from 'react';
import Toolbar from './Toolbar';
import DesktopLayout from './DesktopLayout';
import MobileLayout from './MobileLayout';
import UnderConstructionBanner from './UnderConstructionBanner';
import { EnhancedNode } from '../../types/nodeTypes';
import { EnhancedEdge } from '../../types/edgeTypes';
import { ValidationResult } from '../../hooks/useValidation';
import { useMobileDetection } from '../../hooks/useMobileDetection';

interface MainApplicationLayoutProps {
  children: React.ReactNode;
  isMobileMenuOpen: boolean;
  activePanel: 'palette' | 'properties' | 'validation' | 'settings';
  showValidationPanel: boolean;
  isLeftPanelVisible: boolean;
  isLeftPanelExpanded: boolean;
  isRightPanelVisible: boolean;
  isRightPanelExpanded: boolean;
  nodes: EnhancedNode[];
  edges: EnhancedEdge[];
  selectedNode: EnhancedNode | null;
  selectedEdge: EnhancedEdge | null;
  validationResult: ValidationResult;
  isSelecting?: boolean;
  selectedCount?: number;
  onMobileMenuToggle: () => void;
  onPanelToggle: (panel: 'palette' | 'properties' | 'validation' | 'settings') => void;
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
  onExpandLeftPanel: () => void;
  onExpandRightPanel: () => void;
  closePanels: () => void;
  setShowValidationPanel: (show: boolean) => void;
  switchToPropertiesPanel: () => void;
  onNewProject: () => void;
  onImport: () => void;
  onExport: () => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  onUpdateNodeProperties: (id: string, updates: Partial<EnhancedNode>) => void;
  onUpdateEdgeProperties: (id: string, updates: Partial<EnhancedEdge>) => void;
  validatePriorityConflicts: (nodeId: string, priority: number, currentEdgeId?: string) => { hasConflict: boolean; conflictingEdges: EnhancedEdge[] };
}

const MainApplicationLayout: React.FC<MainApplicationLayoutProps> = ({
  children,
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
  isSelecting = false,
  selectedCount = 0,
  onMobileMenuToggle,
  onPanelToggle,
  onToggleLeftPanel,
  onToggleRightPanel,
  onExpandLeftPanel,
  onExpandRightPanel,
  closePanels,
  setShowValidationPanel,
  switchToPropertiesPanel,
  onNewProject,
  onImport,
  onExport,
  onDeleteNode,
  onDeleteEdge,
  onUpdateNodeProperties,
  onUpdateEdgeProperties,
  validatePriorityConflicts,
}) => {
  const isMobile = useMobileDetection();

  console.log('🏗️ MainApplicationLayout - Render started:', {
    isMobile,
    isLeftPanelVisible,
    isRightPanelVisible,
    isLeftPanelExpanded,
    isRightPanelExpanded,
    layoutChoice: !isMobile ? 'Desktop' : 'Mobile'
  });

  console.log('🏗️ MainApplicationLayout - Props received:', {
    nodes: nodes.length,
    edges: edges.length,
    selectedNode: selectedNode?.id || 'none',
    selectedEdge: selectedEdge?.id || 'none',
    validationResult: validationResult.issues.length + ' issues'
  });

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <UnderConstructionBanner />
      
      <Toolbar
        isMobileMenuOpen={isMobileMenuOpen}
        hasNodes={nodes.length > 0}
        validationResult={validationResult}
        isSelecting={isSelecting}
        selectedCount={selectedCount}
        isRightPanelVisible={isRightPanelVisible}
        onMobileMenuToggle={onMobileMenuToggle}
        onNewProject={onNewProject}
        onImport={onImport}
        onExport={onExport}
        onToggleRightPanel={onToggleRightPanel}
      />

      <div className="flex flex-1 relative overflow-hidden">
        {!isMobile ? (
          <>
            {console.log('🖥️ MainApplicationLayout - Rendering DesktopLayout with props:', {
              isLeftPanelVisible,
              isRightPanelVisible,
              isLeftPanelExpanded,
              isRightPanelExpanded
            })}
            <DesktopLayout
              isLeftPanelVisible={isLeftPanelVisible}
              isLeftPanelExpanded={isLeftPanelExpanded}
              isRightPanelVisible={isRightPanelVisible}
              isRightPanelExpanded={isRightPanelExpanded}
              nodes={nodes}
              edges={edges}
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              validationResult={validationResult}
              showValidationPanel={showValidationPanel}
              onToggleLeftPanel={onToggleLeftPanel}
              onToggleRightPanel={onToggleRightPanel}
              onExpandLeftPanel={onExpandLeftPanel}
              onExpandRightPanel={onExpandRightPanel}
              setShowValidationPanel={setShowValidationPanel}
              switchToPropertiesPanel={switchToPropertiesPanel}
              onDeleteNode={onDeleteNode}
              onDeleteEdge={onDeleteEdge}
              onUpdateNodeProperties={onUpdateNodeProperties}
              onUpdateEdgeProperties={onUpdateEdgeProperties}
              validatePriorityConflicts={validatePriorityConflicts}
            >
              {children}
            </DesktopLayout>
          </>
        ) : (
          <>
            {console.log('📱 MainApplicationLayout - Rendering MobileLayout')}
            <MobileLayout
              isMobileMenuOpen={isMobileMenuOpen}
              activePanel={activePanel}
              showValidationPanel={showValidationPanel}
              nodes={nodes}
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              validationResult={validationResult}
              onMobileMenuToggle={onMobileMenuToggle}
              onPanelToggle={onPanelToggle}
              closePanels={closePanels}
              setShowValidationPanel={setShowValidationPanel}
              onNewProject={onNewProject}
              onImport={onImport}
              onExport={onExport}
              onDeleteNode={onDeleteNode}
              onDeleteEdge={onDeleteEdge}
              onUpdateNodeProperties={onUpdateNodeProperties}
              onUpdateEdgeProperties={onUpdateEdgeProperties}
              validatePriorityConflicts={validatePriorityConflicts}
            >
              {children}
            </MobileLayout>
          </>
        )}
      </div>
    </div>
  );
};

export default MainApplicationLayout;
