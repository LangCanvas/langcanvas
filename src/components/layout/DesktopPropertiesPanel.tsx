
import React, { useEffect } from 'react';
import EnhancedPropertiesPanel from '../EnhancedPropertiesPanel';
import ValidationPanel from '../ValidationPanel';
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
  isVisible?: boolean;
  
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
  isVisible = true,
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

  return (
    <aside 
      className={`hidden lg:flex bg-white border-l border-gray-200 flex-col transition-all duration-300 ease-in-out ${
        isVisible ? 'w-80 translate-x-0' : 'w-0 translate-x-full'
      }`}
      style={{ 
        overflow: isVisible ? 'visible' : 'hidden',
        opacity: isVisible ? 1 : 0
      }}
    >
      {isVisible && (
        <>
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
        </>
      )}
    </aside>
  );
};

export default DesktopPropertiesPanel;
