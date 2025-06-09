
import React from 'react';
import MobilePanelOverlay from './MobilePanelOverlay';
import DesktopPropertiesPanel from './DesktopPropertiesPanel';
import { EnhancedNode } from '../../types/nodeTypes';
import { EnhancedEdge } from '../../types/edgeTypes';
import { ValidationResult } from '../../hooks/useValidation';

interface MainCanvasAreaProps {
  activePanel: 'palette' | 'properties' | null;
  selectedNode: EnhancedNode | null;
  selectedEdge: EnhancedEdge | null;
  allNodes: EnhancedNode[];
  allEdges: EnhancedEdge[];
  validationResult: ValidationResult;
  showValidationPanel: boolean;
  isRightPanelVisible?: boolean;
  
  onClose: () => void;
  onPanelToggle: (panel: 'palette' | 'properties') => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  onUpdateNodeProperties: (nodeId: string, updates: Partial<EnhancedNode>) => void;
  onUpdateEdgeProperties: (edgeId: string, updates: Partial<EnhancedEdge>) => void;
  setShowValidationPanel: (show: boolean) => void;
  switchToPropertiesPanel?: () => void;
  validatePriorityConflicts?: (nodeId: string, priority: number, currentEdgeId?: string) => { hasConflict: boolean; conflictingEdges: EnhancedEdge[] };
  
  children: React.ReactNode;
}

const MainCanvasArea: React.FC<MainCanvasAreaProps> = ({
  activePanel,
  selectedNode,
  selectedEdge,
  allNodes,
  allEdges,
  validationResult,
  showValidationPanel,
  isRightPanelVisible = true,
  onClose,
  onPanelToggle,
  onDeleteNode,
  onDeleteEdge,
  onUpdateNodeProperties,
  onUpdateEdgeProperties,
  setShowValidationPanel,
  switchToPropertiesPanel,
  validatePriorityConflicts,
  children
}) => {
  return (
    <div className="flex-1 flex">
      <div className="flex-1 relative">
        {children}
      </div>

      <MobilePanelOverlay
        activePanel={activePanel}
        selectedNode={selectedNode}
        selectedEdge={selectedEdge}
        onClose={onClose}
        onPanelToggle={onPanelToggle}
        onDeleteNode={onDeleteNode}
        onDeleteEdge={onDeleteEdge}
        onUpdateNodeProperties={onUpdateNodeProperties}
        onUpdateEdgeProperties={onUpdateEdgeProperties}
        allNodes={allNodes}
        allEdges={allEdges}
        validationResult={validationResult}
        showValidationPanel={showValidationPanel}
        setShowValidationPanel={setShowValidationPanel}
        validatePriorityConflicts={validatePriorityConflicts}
      />

      {/* Always render the desktop properties panel - let it handle its own visibility */}
      <DesktopPropertiesPanel
        selectedNode={selectedNode}
        selectedEdge={selectedEdge}
        allNodes={allNodes}
        allEdges={allEdges}
        validationResult={validationResult}
        showValidationPanel={showValidationPanel}
        isExpanded={isRightPanelVisible}
        onUpdateNode={onUpdateNodeProperties}
        onUpdateEdge={onUpdateEdgeProperties}
        onDeleteNode={onDeleteNode}
        onDeleteEdge={onDeleteEdge}
        setShowValidationPanel={setShowValidationPanel}
        switchToPropertiesPanel={switchToPropertiesPanel}
        validatePriorityConflicts={validatePriorityConflicts}
      />
    </div>
  );
};

export default MainCanvasArea;
