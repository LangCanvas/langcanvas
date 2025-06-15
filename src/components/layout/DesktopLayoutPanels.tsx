
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
  console.log('🖥️ DesktopLayoutPanels - Render with absolute constraints:', {
    leftPanelPercentage,
    minLeftPanelPercentage,
    maxLeftPanelPercentage,
    rightPanelPercentage,
    canvasPercentage,
    leftPanelLayout,
    maxWidthPx: '100px enforced via percentage'
  });

  // Add ResizablePanel debugging
  React.useEffect(() => {
    const checkPanelDimensions = () => {
      const container = document.querySelector('[data-panel-group-direction="horizontal"]');
      const rightPanel = document.querySelector('[data-panel="desktop-properties"]');
      
      if (container) {
        const containerRect = container.getBoundingClientRect();
        console.log('🔍 CONTAINER DEBUG:', {
          containerWidth: containerRect.width,
          containerHeight: containerRect.height,
          rightPanelExists: !!rightPanel,
          rightPanelVisible: isRightPanelVisible,
          calculatedRightPanelWidth: (rightPanelPercentage / 100) * containerRect.width,
          expectedRightPanelWidth: rightPanelWidth
        });
      }
      
      if (rightPanel) {
        const rightRect = rightPanel.getBoundingClientRect();
        console.log('🔍 RIGHT PANEL DEBUG:', {
          actualWidth: rightRect.width,
          actualHeight: rightRect.height,
          isVisible: rightRect.width > 0,
          expectedWidth: rightPanelWidth,
          position: { x: rightRect.x, y: rightRect.y }
        });
      }
    };

    // Check dimensions after render
    setTimeout(checkPanelDimensions, 100);
    
    // Also check on resize
    window.addEventListener('resize', checkPanelDimensions);
    return () => window.removeEventListener('resize', checkPanelDimensions);
  }, [isRightPanelVisible, rightPanelWidth, rightPanelPercentage]);

  return (
    <div className="flex-1 h-full" style={{ backgroundColor: '#e0e0e0', border: '2px solid #blue' }}>
      <ResizablePanelGroup direction="horizontal" className="h-full">
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

        <ResizablePanel defaultSize={canvasPercentage} minSize={20} className="relative overflow-hidden">
          {children}
        </ResizablePanel>

        {isRightPanelVisible && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel
              defaultSize={rightPanelPercentage}
              minSize={15}
              maxSize={40}
              onResize={(size) => {
                console.log('🔍 RIGHT PANEL RESIZE EVENT:', {
                  newPercentage: size,
                  expectedPixelWidth: (size / 100) * window.innerWidth,
                  currentRightPanelWidth: rightPanelWidth
                });
                handleRightPanelResize(size);
              }}
              className="relative"
              style={{ backgroundColor: '#00ff00', border: '2px solid #red' }}
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
