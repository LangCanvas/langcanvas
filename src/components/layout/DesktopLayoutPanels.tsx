
import React from 'react';
import DesktopSidebar from './DesktopSidebar';
import DesktopPropertiesPanel from './DesktopPropertiesPanel';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
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
  handleLeftPanelResize,
  handleRightPanelResize,
  leftPanelPercentage,
  rightPanelPercentage,
  canvasPercentage,
  maxLeftPanelPercentage,
  minLeftPanelPercentage,
  onToggleRightPanel,
  setShowValidationPanel,
  switchToPropertiesPanel,
  onDeleteNode,
  onDeleteEdge,
  onUpdateNodeProperties,
  onUpdateEdgeProperties,
  validatePriorityConflicts,
}) => {
  console.log('🖥️ DesktopLayoutPanels - Render with panel configuration:', {
    leftPanelPercentage,
    rightPanelPercentage,
    canvasPercentage,
    isRightPanelVisible,
    rightPanelWidth
  });

  // Calculate safe percentages with proper constraints
  const safeRightPercentage = isRightPanelVisible ? Math.min(30, Math.max(15, rightPanelPercentage)) : 0;
  const safeCanvasPercentage = 100 - leftPanelPercentage - safeRightPercentage;

  console.log('🖥️ DesktopLayoutPanels - Safe percentages:', {
    original: { left: leftPanelPercentage, right: rightPanelPercentage, canvas: canvasPercentage },
    safe: { left: leftPanelPercentage, right: safeRightPercentage, canvas: safeCanvasPercentage }
  });

  return (
    <div className="flex-1 h-full">
      <ResizablePanelGroup 
        direction="horizontal" 
        className="h-full w-full"
        style={{ width: '100%', maxWidth: '100vw' }}
      >
        {isLeftPanelVisible && (
          <>
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

        <ResizablePanel 
          defaultSize={safeCanvasPercentage} 
          minSize={20} 
          className="relative overflow-hidden"
        >
          {children}
        </ResizablePanel>

        {isRightPanelVisible && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel
              defaultSize={safeRightPercentage}
              minSize={15}
              maxSize={30}
              onResize={(size) => {
                console.log('🔍 Right panel resized to:', size, '%');
                handleRightPanelResize(size);
              }}
              className="relative"
              style={{ 
                minWidth: '200px',
                maxWidth: '400px',
                position: 'relative'
              }}
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

export default DesktopLayoutPanels;
