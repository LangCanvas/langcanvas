
import React from 'react';
import DesktopSidebar from './DesktopSidebar';
import DesktopPropertiesPanel from './DesktopPropertiesPanel';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useAdaptivePanelWidths } from '../../hooks/useAdaptivePanelWidths';
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
  const {
    leftPanelWidth,
    rightPanelWidth,
    leftPanelLayout,
    rightPanelLayout,
    handleLeftPanelResize,
    handleRightPanelResize
  } = useAdaptivePanelWidths();

  // Calculate panel sizes for ResizablePanelGroup
  const totalAvailableWidth = window.innerWidth;
  const leftPanelPercentage = isLeftPanelVisible ? (leftPanelWidth / totalAvailableWidth) * 100 : 0;
  const rightPanelPercentage = isRightPanelVisible ? (rightPanelWidth / totalAvailableWidth) * 100 : 0;
  const canvasPercentage = 100 - leftPanelPercentage - rightPanelPercentage;

  return (
    <div className="flex-1 h-full">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel */}
        {isLeftPanelVisible && (
          <>
            <ResizablePanel
              defaultSize={leftPanelPercentage}
              minSize={5}
              maxSize={40}
              onResize={(size) => {
                const newWidth = (size / 100) * totalAvailableWidth;
                handleLeftPanelResize(newWidth);
              }}
              className="relative"
            >
              <DesktopSidebar
                isVisible={isLeftPanelVisible}
                isExpanded={isLeftPanelExpanded}
                onToggle={onToggleLeftPanel}
                onExpand={onExpandLeftPanel}
                panelWidth={leftPanelWidth}
                panelLayout={leftPanelLayout}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}

        {/* Main Canvas Area */}
        <ResizablePanel defaultSize={canvasPercentage} minSize={30} className="relative overflow-hidden">
          {children}
        </ResizablePanel>

        {/* Right Panel */}
        {isRightPanelVisible && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel
              defaultSize={rightPanelPercentage}
              minSize={5}
              maxSize={40}
              onResize={(size) => {
                const newWidth = (size / 100) * totalAvailableWidth;
                handleRightPanelResize(newWidth);
              }}
              className="relative"
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
                panelWidth={rightPanelWidth}
                panelLayout={rightPanelLayout}
              />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};

export default DesktopLayout;
