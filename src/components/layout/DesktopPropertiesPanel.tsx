
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import DesktopPropertiesPanelTabs from './DesktopPropertiesPanelTabs';
import { EnhancedNode } from '../../types/nodeTypes';
import { EnhancedEdge } from '../../types/edgeTypes';
import { ValidationResult } from '../../hooks/useValidation';
import { RightPanelLayout } from '../../hooks/useRightPanelState';
import { useDesktopPropertiesPanelState } from '../../hooks/useDesktopPropertiesPanelState';

interface DesktopPropertiesPanelProps {
  selectedNode: EnhancedNode | null;
  selectedEdge: EnhancedEdge | null;
  allNodes: EnhancedNode[];
  allEdges: EnhancedEdge[];
  validationResult: ValidationResult;
  showValidationPanel: boolean;
  isVisible?: boolean;
  isExpanded?: boolean;
  panelWidth?: number;
  panelLayout?: RightPanelLayout;
  
  onUpdateNode: (nodeId: string, updates: Partial<EnhancedNode>) => void;
  onUpdateEdge: (edgeId: string, updates: Partial<EnhancedEdge>) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  setShowValidationPanel: (show: boolean) => void;
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
  panelWidth = 320,
  panelLayout = 'medium',
  onUpdateNode,
  onUpdateEdge,
  onDeleteNode,
  onDeleteEdge,
  setShowValidationPanel,
  onToggle,
  switchToPropertiesPanel,
  validatePriorityConflicts
}) => {
  console.log('🎛️ DesktopPropertiesPanel - Render started with props:', {
    selectedNode: selectedNode?.id || 'none',
    selectedEdge: selectedEdge?.id || 'none',
    isVisible,
    isExpanded,
    panelWidth,
    panelLayout,
    validationIssues: validationResult.issues.length,
    showValidationPanel
  });

  const { activeTab, setActiveTab } = useDesktopPropertiesPanelState({
    selectedNode,
    selectedEdge,
    showValidationPanel,
    setShowValidationPanel,
    switchToPropertiesPanel
  });

  // Basic dimension checking without offsetParent
  React.useEffect(() => {
    const element = document.querySelector('[data-panel="desktop-properties"]');
    if (element) {
      const rect = element.getBoundingClientRect();
      console.log('🔍 Panel dimensions:', {
        width: rect.width,
        height: rect.height,
        isVisible: rect.width > 0 && rect.height > 0
      });
    }
  });

  if (!isVisible) {
    console.log('🎛️ DesktopPropertiesPanel - Not visible, returning null');
    return null;
  }

  console.log('🎛️ DesktopPropertiesPanel - Continuing with render');

  // Always show expanded panel (no collapsed state)
  const isCompact = panelLayout === 'small';
  
  console.log('🎛️ DesktopPropertiesPanel - Rendering with layout:', {
    isCompact,
    panelLayout,
    activeTab
  });

  return (
    <aside 
      data-panel="desktop-properties" 
      className="relative bg-background border-l border-border flex flex-col h-full flex-shrink-0"
      style={{ 
        minWidth: `${panelWidth}px`,
        width: `${panelWidth}px`
      }}
    >
      <div className={`${isCompact ? 'p-2' : 'p-4'} border-b border-border flex items-center justify-between`}>
        <h2 className={`font-medium text-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>
          {isCompact ? 'Panel' : 'Properties Panel'}
        </h2>
        {onToggle && !isCompact && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-8 h-8 p-0"
            title="Hide Properties Panel"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      <DesktopPropertiesPanelTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedNode={selectedNode}
        selectedEdge={selectedEdge}
        allNodes={allNodes}
        allEdges={allEdges}
        validationResult={validationResult}
        isCompact={isCompact}
        onUpdateNode={onUpdateNode}
        onUpdateEdge={onUpdateEdge}
        onDeleteNode={onDeleteNode}
        onDeleteEdge={onDeleteEdge}
        validatePriorityConflicts={validatePriorityConflicts}
      />
    </aside>
  );
};

export default DesktopPropertiesPanel;
