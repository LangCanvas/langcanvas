
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
  isRightPanelExpanded?: boolean;
  
  onClose: () => void;
  onPanelToggle: (panel: 'palette' | 'properties') => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  onUpdateNodeProperties: (nodeId: string, updates: Partial<EnhancedNode>) => void;
  onUpdateEdgeProperties: (edgeId: string, updates: Partial<EnhancedEdge>) => void;
  setShowValidationPanel: (show: boolean) => void;
  onExpandRightPanel?: () => void;
  onToggleRightPanel?: () => void;
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
  isRightPanelExpanded = true,
  onClose,
  onPanelToggle,
  onDeleteNode,
  onDeleteEdge,
  onUpdateNodeProperties,
  onUpdateEdgeProperties,
  setShowValidationPanel,
  onExpandRightPanel,
  onToggleRightPanel,
  switchToPropertiesPanel,
  validatePriorityConflicts,
  children
}) => {
  console.log("🖼️ MainCanvasArea RENDER START");
  console.log("🖼️ Right panel props - visible:", isRightPanelVisible, "expanded:", isRightPanelExpanded);
  console.log("🖼️ Right panel handlers - onToggle:", !!onToggleRightPanel, "onExpand:", !!onExpandRightPanel);
  
  return (
    <div className="flex-1 flex" style={{ backgroundColor: '#f3f4f6' }}>
      <div className="flex-1 relative bg-blue-100" style={{ backgroundColor: '#dbeafe' }}>
        <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 text-xs rounded z-50">
          MAIN CANVAS DEBUG
        </div>
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

      {/* DEBUG: Always render the panel with debug info */}
      <div className="bg-yellow-200 p-2 text-xs border-l-2 border-yellow-500">
        <div>RIGHT PANEL DEBUG:</div>
        <div>Visible: {isRightPanelVisible ? 'YES' : 'NO'}</div>
        <div>Expanded: {isRightPanelExpanded ? 'YES' : 'NO'}</div>
        <div>Toggle Handler: {onToggleRightPanel ? 'YES' : 'NO'}</div>
      </div>

      <DesktopPropertiesPanel
        selectedNode={selectedNode}
        selectedEdge={selectedEdge}
        allNodes={allNodes}
        allEdges={allEdges}
        validationResult={validationResult}
        showValidationPanel={showValidationPanel}
        isVisible={isRightPanelVisible}
        isExpanded={isRightPanelExpanded}
        onUpdateNode={onUpdateNodeProperties}
        onUpdateEdge={onUpdateEdgeProperties}
        onDeleteNode={onDeleteNode}
        onDeleteEdge={onDeleteEdge}
        setShowValidationPanel={setShowValidationPanel}
        onExpand={onExpandRightPanel}
        onToggle={onToggleRightPanel}
        switchToPropertiesPanel={switchToPropertiesPanel}
        validatePriorityConflicts={validatePriorityConflicts}
      />
    </div>
  );
};

export default MainCanvasArea;
