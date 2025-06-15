
import React from 'react';
import DesktopLayoutPanels from './DesktopLayoutPanels';
import { useDesktopLayoutLogic } from './DesktopLayoutLogic';
import { EnhancedNode } from '../../types/nodeTypes';
import { EnhancedEdge } from '../../types/edgeTypes';
import { ValidationResult } from '../../hooks/useValidation';

interface DesktopLayoutProps {
  children: React.ReactNode;
  isLeftPanelVisible: boolean;
  isLeftPanelExpanded: boolean;
  isRightPanelVisible: boolean;
  isRightPanelExpanded: boolean;
  nodes: EnhancedNode[];
  edges: EnhancedEdge[];
  selectedNode: EnhancedNode | null;
  selectedEdge: EnhancedEdge | null;
  validationResult: ValidationResult;
  showValidationPanel: boolean;
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
  onExpandLeftPanel: () => void;
  onExpandRightPanel: () => void;
  setShowValidationPanel: (show: boolean) => void;
  switchToPropertiesPanel: () => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  onUpdateNodeProperties: (id: string, updates: Partial<EnhancedNode>) => void;
  onUpdateEdgeProperties: (id: string, updates: Partial<EnhancedEdge>) => void;
  validatePriorityConflicts: (nodeId: string, priority: number, currentEdgeId?: string) => { hasConflict: boolean; conflictingEdges: EnhancedEdge[] };
}

const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  children,
  isLeftPanelVisible,
  isRightPanelVisible,
  nodes,
  edges,
  selectedNode,
  selectedEdge,
  validationResult,
  showValidationPanel,
  onToggleRightPanel,
  setShowValidationPanel,
  switchToPropertiesPanel,
  onDeleteNode,
  onDeleteEdge,
  onUpdateNodeProperties,
  onUpdateEdgeProperties,
  validatePriorityConflicts,
}) => {
  console.log('🖥️ DesktopLayout - Render started with props:', {
    isLeftPanelVisible,
    isRightPanelVisible,
    children: !!children,
    nodes: nodes.length,
    edges: edges.length
  });

  const layoutLogic = useDesktopLayoutLogic(isLeftPanelVisible, isRightPanelVisible);

  return (
    <DesktopLayoutPanels
      children={children}
      isLeftPanelVisible={isLeftPanelVisible}
      isRightPanelVisible={isRightPanelVisible}
      nodes={nodes}
      edges={edges}
      selectedNode={selectedNode}
      selectedEdge={selectedEdge}
      validationResult={validationResult}
      showValidationPanel={showValidationPanel}
      onToggleRightPanel={onToggleRightPanel}
      setShowValidationPanel={setShowValidationPanel}
      switchToPropertiesPanel={switchToPropertiesPanel}
      onDeleteNode={onDeleteNode}
      onDeleteEdge={onDeleteEdge}
      onUpdateNodeProperties={onUpdateNodeProperties}
      onUpdateEdgeProperties={onUpdateEdgeProperties}
      validatePriorityConflicts={validatePriorityConflicts}
      {...layoutLogic}
    />
  );
};

export default DesktopLayout;
