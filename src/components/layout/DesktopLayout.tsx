
import React from 'react';
import DesktopSidebar from './DesktopSidebar';
import DesktopPropertiesPanel from './DesktopPropertiesPanel';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useLeftPanelState } from '../../hooks/useLeftPanelState';
import { useRightPanelState } from '../../hooks/useRightPanelState';
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

  // SEPARATE INDEPENDENT PANEL HOOKS
  const {
    leftPanelWidth,
    leftPanelLayout,
    handleLeftPanelResize,
    getMaxPercentageForLeftPanel,
    getMinPercentageForLeftPanel
  } = useLeftPanelState();

  const {
    rightPanelWidth,
    rightPanelLayout,
    handleRightPanelResize,
  } = useRightPanelState();

  console.log('🖥️ DesktopLayout - Independent panel states:', {
    leftPanelWidth,
    leftPanelLayout,
    rightPanelWidth,
    rightPanelLayout,
    areIndependent: true
  });

  // Conservative sizing for reliable panel visibility
  const leftPanelPercentage = isLeftPanelVisible ? 7 : 0; // Fixed 7% for left panel
  const rightPanelPercentage = isRightPanelVisible ? 20 : 0; // Fixed 20% for right panel  
  const canvasPercentage = 100 - leftPanelPercentage - rightPanelPercentage;

  console.log('🖥️ DesktopLayout - Panel percentages:', {
    leftPanelPercentage,
    rightPanelPercentage,
    canvasPercentage,
    leftVisible: isLeftPanelVisible,
    rightVisible: isRightPanelVisible
  });

  // Calculate the maximum and minimum percentages for the left panel
  const maxLeftPanelPercentage = getMaxPercentageForLeftPanel();
  const minLeftPanelPercentage = getMinPercentageForLeftPanel();

  console.log('🖥️ DesktopLayout - Left panel constraints:', {
    maxLeftPanelPercentage,
    minLeftPanelPercentage
  });

  // Log right panel configuration before render
  if (isRightPanelVisible) {
    console.log('🎛️ DesktopLayout - Right panel ResizablePanel config:', {
      defaultSize: rightPanelPercentage,
      minSize: 12,
      maxSize: 35,
      timestamp: new Date().toISOString()
    });
  }

  return (
    <div className="flex-1 h-full">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {isLeftPanelVisible && (
          <>
            <ResizablePanel
              defaultSize={leftPanelPercentage}
              minSize={5}
              maxSize={10}
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

        <ResizablePanel defaultSize={canvasPercentage} minSize={20} className="relative overflow-hidden">
          {children}
        </ResizablePanel>

        {isRightPanelVisible && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel
              defaultSize={rightPanelPercentage}
              minSize={12}
              maxSize={35}
              onResize={handleRightPanelResize}
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
    </div>
  );
};

export default DesktopLayout;
