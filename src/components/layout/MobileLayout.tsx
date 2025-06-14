
import React from 'react';
import MobileMenu from './MobileMenu';
import MobilePanelOverlay from './MobilePanelOverlay';
import MobileBottomNav from './MobileBottomNav';
import { EnhancedNode } from '../../types/nodeTypes';
import { EnhancedEdge } from '../../types/edgeTypes';
import { ValidationResult } from '../../hooks/useValidation';

interface MobileLayoutProps {
  children: React.ReactNode;
  isMobileMenuOpen: boolean;
  activePanel: 'palette' | 'properties' | 'validation' | 'settings';
  showValidationPanel: boolean;
  nodes: EnhancedNode[];
  selectedNode: EnhancedNode | null;
  selectedEdge: EnhancedEdge | null;
  validationResult: ValidationResult;
  onMobileMenuToggle: () => void;
  onPanelToggle: (panel: 'palette' | 'properties' | 'validation' | 'settings') => void;
  closePanels: () => void;
  setShowValidationPanel: (show: boolean) => void;
  onNewProject: () => void;
  onImport: () => void;
  onExport: () => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  onUpdateNodeProperties: (id: string, updates: Partial<EnhancedNode>) => void;
  onUpdateEdgeProperties: (id: string, updates: Partial<EnhancedEdge>) => void;
  validatePriorityConflicts: (nodeId: string, priority: number, currentEdgeId?: string) => { hasConflict: boolean; conflictingEdges: EnhancedEdge[] };
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  isMobileMenuOpen,
  activePanel,
  showValidationPanel,
  nodes,
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
  validatePriorityConflicts,
}) => {
  return (
    <>
      <div className="flex-1 relative">
        {children}
      </div>

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
  );
};

export default MobileLayout;
