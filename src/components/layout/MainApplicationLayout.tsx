
import React from 'react';
import Toolbar from './Toolbar';
import DesktopSidebar from './DesktopSidebar';
import DesktopPropertiesPanel from './DesktopPropertiesPanel';
import MobileMenu from './MobileMenu';
import MobilePanelOverlay from './MobilePanelOverlay';
import MobileBottomNav from './MobileBottomNav';
import MainCanvasArea from './MainCanvasArea';
import { EnhancedNode } from '../../types/nodeTypes';
import { EnhancedEdge } from '../../types/edgeTypes';
import { ValidationResult } from '../../hooks/useValidation';
import { useMobileDetection } from '../../hooks/useMobileDetection';
import { useMultiSelection } from '../../hooks/useMultiSelection';

interface MainApplicationLayoutProps {
  children: React.ReactNode;
  isMobileMenuOpen: boolean;
  activePanel: 'palette' | 'properties' | 'validation';
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
  onMobileMenuToggle: () => void;
  onPanelToggle: (panel: 'palette' | 'properties' | 'validation') => void;
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
  const { selectedNodeIds, isSelecting } = useMultiSelection();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Toolbar
        isMobileMenuOpen={isMobileMenuOpen}
        hasNodes={nodes.length > 0}
        validationResult={validationResult}
        isSelecting={isSelecting}
        selectedCount={selectedNodeIds.length}
        onMobileMenuToggle={onMobileMenuToggle}
        onNewProject={onNewProject}
        onImport={onImport}
        onExport={onExport}
      />

      <div className="flex flex-1 relative overflow-hidden">
        {/* Desktop Layout */}
        {!isMobile && (
          <>
            <DesktopSidebar
              isVisible={isLeftPanelVisible}
              isExpanded={isLeftPanelExpanded}
              onToggle={onToggleLeftPanel}
              onExpand={onExpandLeftPanel}
            />

            <MainCanvasArea
              isLeftPanelVisible={isLeftPanelVisible}
              isLeftPanelExpanded={isLeftPanelExpanded}
              isRightPanelVisible={isRightPanelVisible}
              isRightPanelExpanded={isRightPanelExpanded}
            >
              {children}
            </MainCanvasArea>

            <DesktopPropertiesPanel
              isVisible={isRightPanelVisible}
              isExpanded={isRightPanelExpanded}
              activePanel={activePanel}
              showValidationPanel={showValidationPanel}
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              validationResult={validationResult}
              onToggle={onToggleRightPanel}
              onExpand={onExpandRightPanel}
              onPanelToggle={onPanelToggle}
              setShowValidationPanel={setShowValidationPanel}
              onDeleteNode={onDeleteNode}
              onDeleteEdge={onDeleteEdge}
              onUpdateNodeProperties={onUpdateNodeProperties}
              onUpdateEdgeProperties={onUpdateEdgeProperties}
              validatePriorityConflicts={validatePriorityConflicts}
            />
          </>
        )}

        {/* Mobile Layout */}
        {isMobile && (
          <>
            <MainCanvasArea
              isLeftPanelVisible={false}
              isLeftPanelExpanded={false}
              isRightPanelVisible={false}
              isRightPanelExpanded={false}
            >
              {children}
            </MainCanvasArea>

            <MobileMenu
              isOpen={isMobileMenuOpen}
              onClose={() => onMobileMenuToggle()}
              onNewProject={onNewProject}
              onImport={onImport}
              onExport={onExport}
              onPanelToggle={onPanelToggle}
              hasNodes={nodes.length > 0}
            />

            <MobilePanelOverlay
              activePanel={activePanel}
              showValidationPanel={showValidationPanel}
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              validationResult={validationResult}
              onClose={closePanels}
              onDeleteNode={onDeleteNode}
              onDeleteEdge={onDeleteEdge}
              onUpdateNodeProperties={onUpdateNodeProperties}
              onUpdateEdgeProperties={onUpdateEdgeProperties}
              validatePriorityConflicts={validatePriorityConflicts}
            />

            <MobileBottomNav
              activePanel={activePanel}
              validationResult={validationResult}
              onPanelToggle={onPanelToggle}
              setShowValidationPanel={setShowValidationPanel}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default MainApplicationLayout;
