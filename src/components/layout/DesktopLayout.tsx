
import React from 'react';
import DesktopSidebar from './DesktopSidebar';
import DesktopPropertiesPanel from './DesktopPropertiesPanel';
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
  isLeftPanelExpanded,
  isRightPanelVisible,
  isRightPanelExpanded,
  nodes,
  edges,
  selectedNode,
  selectedEdge,
  validationResult,
  showValidationPanel,
  onToggleLeftPanel,
  onToggleRightPanel,
  onExpandLeftPanel,
  onExpandRightPanel,
  setShowValidationPanel,
  switchToPropertiesPanel,
  onDeleteNode,
  onDeleteEdge,
  onUpdateNodeProperties,
  onUpdateEdgeProperties,
  validatePriorityConflicts,
}) => {
  // Calculate margins for desktop layout
  const getLeftMargin = () => {
    if (!isLeftPanelVisible) return 0;
    return isLeftPanelExpanded ? 256 : 56; // 256px expanded, 56px collapsed
  };

  const getRightMargin = () => {
    if (!isRightPanelVisible) return 0;
    return isRightPanelExpanded ? 320 : 56; // 320px expanded, 56px collapsed
  };

  return (
    <>
      {/* Left Panel */}
      {isLeftPanelVisible && (
        <div 
          className="fixed left-0 top-14 bottom-8 z-20 transition-all duration-300 ease-in-out"
          style={{ width: isLeftPanelExpanded ? '256px' : '56px' }}
        >
          <DesktopSidebar
            isVisible={isLeftPanelVisible}
            isExpanded={isLeftPanelExpanded}
            onToggle={onToggleLeftPanel}
            onExpand={onExpandLeftPanel}
          />
        </div>
      )}

      {/* Main Canvas Area */}
      <div 
        className="flex-1 transition-all duration-300 ease-in-out overflow-hidden"
        style={{
          marginLeft: `${getLeftMargin()}px`,
          marginRight: `${getRightMargin()}px`,
        }}
      >
        {children}
      </div>

      {/* Right Panel */}
      {isRightPanelVisible && (
        <div 
          className="fixed right-0 top-14 bottom-8 z-20 transition-all duration-300 ease-in-out"
          style={{ width: isRightPanelExpanded ? '320px' : '56px' }}
        >
          <DesktopPropertiesPanel
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            allNodes={nodes}
            allEdges={edges}
            validationResult={validationResult}
            showValidationPanel={showValidationPanel}
            isVisible={isRightPanelVisible}
            isExpanded={isRightPanelExpanded}
            onUpdateNode={onUpdateNodeProperties}
            onUpdateEdge={onUpdateEdgeProperties}
            onDeleteNode={onDeleteNode}
            onDeleteEdge={onDeleteEdge}
            setShowValidationPanel={setShowValidationPanel}
            onToggle={onToggleRightPanel}
            onExpand={onExpandRightPanel}
            switchToPropertiesPanel={switchToPropertiesPanel}
            validatePriorityConflicts={validatePriorityConflicts}
          />
        </div>
      )}
    </>
  );
};

export default DesktopLayout;
