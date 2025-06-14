
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
  isRightPanelVisible,
  nodes,
  edges,
  selectedNode,
  selectedEdge,
  validationResult,
  showValidationPanel,
  onToggleLeftPanel,
  onToggleRightPanel,
  setShowValidationPanel,
  switchToPropertiesPanel,
  onDeleteNode,
  onDeleteEdge,
  onUpdateNodeProperties,
  onUpdateEdgeProperties,
  validatePriorityConflicts,
}) => {
  console.log('🖥️ DesktopLayout - Render started with props:', {
    isLeftPanelVisible,
    isRightPanelVisible,
    children: !!children,
    nodes: nodes.length,
    edges: edges.length
  });

  const {
    leftPanelWidth,
    rightPanelWidth,
    leftPanelLayout,
    rightPanelLayout,
    handleLeftPanelResize,
    handleRightPanelResize,
    getInitialPercentage,
    getMaxPercentageForLeftPanel,
    getMinPercentageForLeftPanel
  } = useAdaptivePanelWidths();

  console.log('🖥️ DesktopLayout - Panel widths and layouts:', {
    leftPanelWidth,
    rightPanelWidth,
    leftPanelLayout,
    rightPanelLayout
  });

  const leftPanelPercentage = getInitialPercentage(leftPanelWidth, isLeftPanelVisible);
  const rightPanelPercentage = getInitialPercentage(rightPanelWidth, isRightPanelVisible);
  const canvasPercentage = Math.max(30, 100 - leftPanelPercentage - rightPanelPercentage);

  console.log('🖥️ DesktopLayout - Calculated percentages:', {
    leftPanelPercentage,
    rightPanelPercentage,
    canvasPercentage,
    leftVisible: isLeftPanelVisible,
    rightVisible: isRightPanelVisible
  });

  // Calculate the maximum and minimum percentages for the left panel
  const maxLeftPanelPercentage = getMaxPercentageForLeftPanel();
  const minLeftPanelPercentage = getMinPercentageForLeftPanel();

  console.log('🖥️ DesktopLayout - Panel constraints:', {
    maxLeftPanelPercentage,
    minLeftPanelPercentage
  });

  return (
    <div className="flex-1 h-full">
      {console.log('🖥️ DesktopLayout - Starting ResizablePanelGroup render')}
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {isLeftPanelVisible && (
          <>
            {console.log('🖥️ DesktopLayout - Rendering left panel with percentage:', leftPanelPercentage)}
            <ResizablePanel
              defaultSize={leftPanelPercentage}
              minSize={minLeftPanelPercentage}
              maxSize={maxLeftPanelPercentage}
              onResize={handleLeftPanelResize}
              className="relative"
            >
              <DesktopSidebar
                isVisible={isLeftPanelVisible}
                isExpanded={true}
                panelWidth={leftPanelWidth}
                panelLayout={leftPanelLayout}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}

        {console.log('🖥️ DesktopLayout - Rendering canvas panel with percentage:', canvasPercentage)}
        <ResizablePanel defaultSize={canvasPercentage} minSize={30} className="relative overflow-hidden">
          {children}
        </ResizablePanel>

        {isRightPanelVisible && (
          <>
            {console.log('🖥️ DesktopLayout - Rendering right panel with percentage:', rightPanelPercentage)}
            <ResizableHandle withHandle />
            <ResizablePanel
              defaultSize={rightPanelPercentage}
              minSize={3}
              maxSize={35}
              onResize={handleRightPanelResize}
              className="relative"
            >
              {console.log('🖥️ DesktopLayout - About to render DesktopPropertiesPanel with props:', {
                selectedNode: selectedNode?.id || 'none',
                selectedEdge: selectedEdge?.id || 'none',
                isVisible: isRightPanelVisible,
                panelWidth: rightPanelWidth,
                panelLayout: rightPanelLayout
              })}
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
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
      {console.log('🖥️ DesktopLayout - Render completed')}
    </div>
  );
};

export default DesktopLayout;
