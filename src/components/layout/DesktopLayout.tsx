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

  console.log('🚨 DEBUG - DesktopLayout received props:', {
    isRightPanelVisible,
    timestamp: new Date().toISOString()
  });

  const {
    leftPanelWidth,
    rightPanelWidth,
    leftPanelLayout,
    rightPanelLayout,
    handleLeftPanelResize,
    getMaxPercentageForLeftPanel,
    getMinPercentageForLeftPanel
  } = useAdaptivePanelWidths();

  console.log('🖥️ DesktopLayout - Panel widths and layouts:', {
    leftPanelWidth,
    rightPanelWidth,
    leftPanelLayout,
    rightPanelLayout
  });

  // INDEPENDENT right panel resize handler (not using adaptive panel widths)
  const handleRightPanelResizeIndependent = React.useCallback((percentage: number) => {
    console.log('🎛️ DesktopLayout - Right panel resize (independent):', {
      percentage,
      timestamp: new Date().toISOString()
    });
    // Simple percentage tracking without complex pixel conversions
    // This just lets the ResizablePanel handle its own constraints
  }, []);

  // Conservative sizing for reliable panel visibility
  const leftPanelPercentage = isLeftPanelVisible ? 7 : 0; // Fixed 7% for left panel
  const rightPanelPercentage = isRightPanelVisible ? 20 : 0; // Reduced to 20% for right panel  
  const canvasPercentage = 100 - leftPanelPercentage - rightPanelPercentage;

  console.log('🖥️ DesktopLayout - CONSERVATIVE percentages:', {
    leftPanelPercentage,
    rightPanelPercentage,
    canvasPercentage,
    leftVisible: isLeftPanelVisible,
    rightVisible: isRightPanelVisible
  });

  console.log('🚨 DEBUG - DesktopLayout calculated percentages:', {
    rightPanelPercentage,
    isRightPanelVisible,
    willRenderRightPanel: isRightPanelVisible
  });

  // Calculate the maximum and minimum percentages for the left panel
  const maxLeftPanelPercentage = getMaxPercentageForLeftPanel();
  const minLeftPanelPercentage = getMinPercentageForLeftPanel();

  console.log('🖥️ DesktopLayout - Panel constraints:', {
    maxLeftPanelPercentage,
    minLeftPanelPercentage
  });

  console.log('🖥️ DesktopLayout - Starting ResizablePanelGroup render');

  // Log rendering decisions before JSX
  console.log('🚨 DEBUG - DesktopLayout rendering DesktopPropertiesPanel with isVisible:', isRightPanelVisible);
  console.log('🚨 DEBUG - DesktopLayout conditional for right panel:', {
    condition: isRightPanelVisible,
    willRender: isRightPanelVisible ? 'YES' : 'NO'
  });

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
              onResize={handleRightPanelResizeIndependent}
              className="relative"
            >
              {console.log('🎛️ DesktopLayout - Right panel ResizablePanel config:', {
                defaultSize: rightPanelPercentage,
                minSize: 12,
                maxSize: 35,
                timestamp: new Date().toISOString()
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
    </div>
  );
};

export default DesktopLayout;
