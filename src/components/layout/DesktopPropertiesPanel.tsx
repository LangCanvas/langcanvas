import React, { useEffect } from 'react';
import EnhancedPropertiesPanel from '../EnhancedPropertiesPanel';
import ValidationPanel from '../ValidationPanel';
import CollapsedPropertiesPanel from './CollapsedPropertiesPanel';
import RightPanelToggle from './RightPanelToggle';
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
  isExpanded?: boolean;
  
  onUpdateNode: (nodeId: string, updates: Partial<EnhancedNode>) => void;
  onUpdateEdge: (edgeId: string, updates: Partial<EnhancedEdge>) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  setShowValidationPanel: (show: boolean) => void;
  onExpand?: () => void;
  onToggle?: () => void;
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
  isExpanded = true,
  onUpdateNode,
  onUpdateEdge,
  onDeleteNode,
  onDeleteEdge,
  setShowValidationPanel,
  onExpand,
  onToggle,
  switchToPropertiesPanel,
  validatePriorityConflicts
}) => {
  // Smart switching: when user selects a node/edge while validation panel is showing
  useEffect(() => {
    if ((selectedNode || selectedEdge) && showValidationPanel && switchToPropertiesPanel) {
      switchToPropertiesPanel();
    }
  }, [selectedNode, selectedEdge, showValidationPanel, switchToPropertiesPanel]);

  // Debug logging
  useEffect(() => {
    console.log('🎛️ DesktopPropertiesPanel render state:', {
      isVisible,
      isExpanded,
      onExpand: !!onExpand,
      onToggle: !!onToggle
    });
  }, [isVisible, isExpanded, onExpand, onToggle]);

  const handleUpdateEdge = (edgeId: string, updates: Partial<EnhancedEdge>) => {
    onUpdateEdge(edgeId, updates);
  };

  const handleExpand = () => {
    console.log('🎛️ CollapsedPropertiesPanel expand clicked');
    if (onExpand) {
      onExpand();
    }
  };

  // If not visible, don't render anything
  if (!isVisible) {
    console.log('🎛️ DesktopPropertiesPanel not visible, returning null');
    return null;
  }

  // Show collapsed panel when not expanded
  if (!isExpanded) {
    console.log('🎛️ DesktopPropertiesPanel rendering collapsed state');
    return (
      <aside 
        data-panel="desktop-properties" 
        className="relative bg-red-100 border-4 border-red-500 flex flex-col min-w-14 w-14 flex-shrink-0 z-10"
        style={{ minWidth: '3.5rem', width: '3.5rem' }}
      >
        <div className="text-xs text-red-600 p-1">COLLAPSED</div>
        <CollapsedPropertiesPanel
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          validationResult={validationResult}
          onExpand={handleExpand}
        />
        {onToggle && (
          <RightPanelToggle isExpanded={isExpanded} onToggle={onToggle} />
        )}
      </aside>
    );
  }

  // Show expanded panel
  console.log('🎛️ DesktopPropertiesPanel rendering expanded state');
  return (
    <aside 
      data-panel="desktop-properties" 
      className="relative w-80 bg-white border-l border-gray-200 flex flex-col flex-shrink-0"
    >
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
      
      {onToggle && (
        <RightPanelToggle isExpanded={isExpanded} onToggle={onToggle} />
      )}
    </aside>
  );
};

export default DesktopPropertiesPanel;
