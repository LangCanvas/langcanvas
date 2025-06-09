
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
  
  onClose: () => void;
  onPanelToggle: (panel: 'palette' | 'properties') => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  onUpdateNodeProperties: (nodeId: string, updates: Partial<EnhancedNode>) => void;
  onUpdateEdgeProperties: (edgeId: string, updates: Partial<EnhancedEdge>) => void;
  setShowValidationPanel: (show: boolean) => void;
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
  onClose,
  onPanelToggle,
  onDeleteNode,
  onDeleteEdge,
  onUpdateNodeProperties,
  onUpdateEdgeProperties,
  setShowValidationPanel,
  validatePriorityConflicts,
  children
}) => {
  const nodeOutgoingEdges = selectedNode 
    ? allEdges.filter(edge => edge.source === selectedNode.id)
    : [];

  return (
    <>
      <MobilePanelOverlay
        activePanel={activePanel}
        onClose={onClose}
        onPanelToggle={onPanelToggle}
        selectedNode={selectedNode}
        selectedEdge={selectedEdge}
        onDeleteNode={onDeleteNode}
        onDeleteEdge={onDeleteEdge}
        onUpdateNodeProperties={onUpdateNodeProperties}
        onUpdateEdgeProperties={onUpdateEdgeProperties}
        allNodes={allNodes}
        allEdges={allEdges}
        nodeOutgoingEdges={nodeOutgoingEdges}
        validationResult={validationResult}
      />

      <main className="flex-1 relative overflow-auto">
        {children}
      </main>

      <DesktopPropertiesPanel
        selectedNode={selectedNode}
        selectedEdge={selectedEdge}
        allNodes={allNodes}
        allEdges={allEdges}
        validationResult={validationResult}
        showValidationPanel={showValidationPanel}
        onUpdateNode={onUpdateNodeProperties}
        onUpdateEdge={onUpdateEdgeProperties}
        onDeleteNode={onDeleteNode}
        onDeleteEdge={onDeleteEdge}
        setShowValidationPanel={setShowValidationPanel}
        validatePriorityConflicts={validatePriorityConflicts}
      />
    </>
  );
};

export default MainCanvasArea;
