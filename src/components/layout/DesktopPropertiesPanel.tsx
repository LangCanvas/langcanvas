
import React, { useEffect } from 'react';
import EnhancedPropertiesPanel from '../EnhancedPropertiesPanel';
import ValidationPanel from '../ValidationPanel';
import CollapsedPropertiesPanel from './CollapsedPropertiesPanel';
import { EnhancedNode } from '../../types/nodeTypes';
import { EnhancedEdge } from '../../types/edgeTypes';
import { ValidationResult } from '../../hooks/useValidation';

interface DesktopPropertiesPanelProps {
  selectedNode: EnhancedNode | null;
  selectedEdge: EnhancedEdge | null;
  allNodes: EnhancedNode[];
  allEdges: EnhancedEdge[];
  validationResult: ValidationResult;
  showValidationPanel: boolean;
  isExpanded?: boolean;
  
  onUpdateNode: (nodeId: string, updates: Partial<EnhancedNode>) => void;
  onUpdateEdge: (edgeId: string, updates: Partial<EnhancedEdge>) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  setShowValidationPanel: (show: boolean) => void;
  switchToPropertiesPanel?: () => void;
  validatePriorityConflicts?: (nodeId: string, priority: number, currentEdgeId?: string) => { hasConflict: boolean; conflictingEdges: EnhancedEdge[] };
}

const DesktopPropertiesPanel: React.FC<DesktopPropertiesPanelProps> = ({
  selectedNode,
  selectedEdge,
  allNodes,
  allEdges,
  validationResult,
  showValidationPanel,
  isExpanded = true,
  onUpdateNode,
  onUpdateEdge,
  onDeleteNode,
  onDeleteEdge,
  setShowValidationPanel,
  switchToPropertiesPanel,
  validatePriorityConflicts
}) => {
  // Smart switching: when user selects a node/edge while validation panel is showing
  useEffect(() => {
    if ((selectedNode || selectedEdge) && showValidationPanel && switchToPropertiesPanel) {
      switchToPropertiesPanel();
    }
  }, [selectedNode, selectedEdge, showValidationPanel, switchToPropertiesPanel]);

  const handleUpdateEdge = (edgeId: string, updates: Partial<EnhancedEdge>) => {
    onUpdateEdge(edgeId, updates);
  };

  const handleExpand = () => {
    // This will be handled by the parent component through the toggle button
    console.log('Expand panel requested');
  };

  // Show collapsed panel when not expanded
  if (!isExpanded) {
    return (
      <CollapsedPropertiesPanel
        selectedNode={selectedNode}
        selectedEdge={selectedEdge}
        validationResult={validationResult}
        onExpand={handleExpand}
      />
    );
  }

  // Show expanded panel
  return (
    <aside className="w-80 bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ease-in-out">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-700">Properties</h2>
        {validationResult.issues.length > 0 && (
          <button
            onClick={() => setShowValidationPanel(!showValidationPanel)}
            className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ValidationPanel validationResult={validationResult} compact />
          </button>
        )}
      </div>
      
      {showValidationPanel ? (
        <ValidationPanel 
          validationResult={validationResult} 
          onClose={() => setShowValidationPanel(false)}
        />
      ) : (
        <EnhancedPropertiesPanel 
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          allNodes={allNodes}
          allEdges={allEdges}
          onUpdateNode={onUpdateNode}
          onUpdateEdge={handleUpdateEdge}
          onDeleteNode={onDeleteNode}
          onDeleteEdge={onDeleteEdge}
          validatePriorityConflicts={validatePriorityConflicts}
        />
      )}
    </aside>
  );
};

export default DesktopPropertiesPanel;
