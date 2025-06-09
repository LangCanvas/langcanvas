
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
  console.log("🎛️ DesktopPropertiesPanel RENDER START");
  console.log("🎛️ Props - isVisible:", isVisible, "isExpanded:", isExpanded);
  console.log("🎛️ Selected - Node:", selectedNode?.id || 'none', "Edge:", selectedEdge?.id || 'none');

  // Debug logging on mount and prop changes
  useEffect(() => {
    console.log("🎛️ DesktopPropertiesPanel MOUNTED - DOM Element should be present");
    const panelElement = document.querySelector('[data-panel="desktop-properties"]');
    console.log("🎛️ Panel DOM element found:", !!panelElement);
    if (panelElement) {
      console.log("🎛️ Panel computed styles:", window.getComputedStyle(panelElement));
    }
  }, []);

  useEffect(() => {
    console.log("🎛️ DesktopPropertiesPanel VISIBILITY CHANGED - isVisible:", isVisible, "isExpanded:", isExpanded);
  }, [isVisible, isExpanded]);

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
    console.log('🎛️ Expand panel requested');
    if (onExpand) {
      onExpand();
    }
  };

  // DEBUG: Log when component would not render
  if (!isVisible) {
    console.log("🎛️ DesktopPropertiesPanel NOT RENDERING - isVisible is false");
    return null;
  }

  // Show collapsed panel when not expanded
  if (!isExpanded) {
    console.log("🎛️ DesktopPropertiesPanel RENDERING COLLAPSED");
    return (
      <aside 
        data-panel="desktop-properties" 
        className="relative w-14 bg-red-200 border-l border-gray-200 flex flex-col transition-all duration-300 ease-in-out"
        style={{ minHeight: '100vh', backgroundColor: '#fee2e2' }}
      >
        <div className="p-2 bg-red-300 text-xs font-bold">COLLAPSED PANEL DEBUG</div>
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
  console.log("🎛️ DesktopPropertiesPanel RENDERING EXPANDED");
  return (
    <aside 
      data-panel="desktop-properties" 
      className="relative w-80 bg-green-200 border-l border-gray-200 flex flex-col transition-all duration-300 ease-in-out"
      style={{ minHeight: '100vh', backgroundColor: '#dcfce7' }}
    >
      <div className="p-2 bg-green-300 text-xs font-bold">EXPANDED PANEL DEBUG - Visible: {isVisible ? 'YES' : 'NO'}</div>
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
