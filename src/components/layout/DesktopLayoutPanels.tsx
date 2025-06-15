
import React from 'react';
import DesktopSidebar from './DesktopSidebar';
import DesktopPropertiesPanel from './DesktopPropertiesPanel';
import { EnhancedNode } from '../../types/nodeTypes';
import { EnhancedEdge } from '../../types/edgeTypes';
import { ValidationResult } from '../../hooks/useValidation';
import { LeftPanelLayout } from '../../hooks/useLeftPanelState';
import { RightPanelLayout } from '../../hooks/useRightPanelState';

interface DesktopLayoutPanelsProps {
  children: React.ReactNode;
  isLeftPanelVisible: boolean;
  isRightPanelVisible: boolean;
  nodes: EnhancedNode[];
  edges: EnhancedEdge[];
  selectedNode: EnhancedNode | null;
  selectedEdge: EnhancedEdge | null;
  validationResult: ValidationResult;
  showValidationPanel: boolean;
  leftPanelWidth: number;
  leftPanelLayout: LeftPanelLayout;
  rightPanelWidth: number;
  rightPanelLayout: RightPanelLayout;
  handleLeftPanelResize: (percentage: number) => void;
  handleRightPanelResize: (percentage: number) => void;
  leftPanelPercentage: number;
  rightPanelPercentage: number;
  canvasPercentage: number;
  maxLeftPanelPercentage: number;
  minLeftPanelPercentage: number;
  onToggleRightPanel: () => void;
  setShowValidationPanel: (show: boolean) => void;
  switchToPropertiesPanel: () => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  onUpdateNodeProperties: (id: string, updates: Partial<EnhancedNode>) => void;
  onUpdateEdgeProperties: (id: string, updates: Partial<EnhancedEdge>) => void;
  validatePriorityConflicts: (nodeId: string, priority: number, currentEdgeId?: string) => { hasConflict: boolean; conflictingEdges: EnhancedEdge[] };
}

const DesktopLayoutPanels: React.FC<DesktopLayoutPanelsProps> = ({
  children,
  isLeftPanelVisible,
  isRightPanelVisible,
  nodes,
  edges,
  selectedNode,
  selectedEdge,
  validationResult,
  showValidationPanel,
  leftPanelWidth,
  leftPanelLayout,
  rightPanelWidth,
  rightPanelLayout,
  onToggleRightPanel,
  setShowValidationPanel,
  switchToPropertiesPanel,
  onDeleteNode,
  onDeleteEdge,
  onUpdateNodeProperties,
  onUpdateEdgeProperties,
  validatePriorityConflicts,
}) => {
  console.log('🖥️ DesktopLayoutPanels - Clean layout with fixed widths:', {
    isLeftPanelVisible,
    isRightPanelVisible,
    leftPanelWidth,
    rightPanelWidth
  });

  return (
    <div className="flex h-full w-full bg-gray-50">
      {/* Left Panel */}
      {isLeftPanelVisible && (
        <div 
          className="flex-shrink-0 bg-white border-r border-gray-200"
          style={{ width: `${leftPanelWidth}px` }}
        >
          <DesktopSidebar
            isVisible={isLeftPanelVisible}
            isExpanded={true}
            panelWidth={leftPanelWidth}
            panelLayout={leftPanelLayout}
          />
        </div>
      )}

      {/* Canvas Area */}
      <div className="flex-1 bg-gray-100 overflow-hidden">
        {children}
      </div>

      {/* Right Panel */}
      {isRightPanelVisible && (
        <div 
          className="flex-shrink-0 bg-white border-l border-gray-200"
          style={{ width: `${rightPanelWidth}px` }}
        >
          <DesktopPropertiesPanel
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            allNodes={nodes}
            allEdges={edges}
            validationResult={validationResult}
            showValidationPanel={showValidationPanel}
            isVisible={isRightPanelVisible}
            isExpanded={true}
            onUpdateNode={onUpdateNodeProperties}
            onUpdateEdge={onUpdateEdgeProperties}
            onDeleteNode={onDeleteNode}
            onDeleteEdge={onDeleteEdge}
            setShowValidationPanel={setShowValidationPanel}
            onToggle={onToggleRightPanel}
            switchToPropertiesPanel={switchToPropertiesPanel}
            validatePriorityConflicts={validatePriorityConflicts}
            panelWidth={rightPanelWidth}
            panelLayout={rightPanelLayout}
          />
        </div>
      )}
    </div>
  );
};

export default DesktopLayoutPanels;
