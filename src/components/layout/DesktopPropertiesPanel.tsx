
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
      className="relative bg-red-100 border-l-4 border-red-500 flex flex-col h-full flex-shrink-0"
      style={{ 
        minWidth: `${panelWidth}px`,
        width: `${panelWidth}px`,
        maxWidth: `${panelWidth}px`,
        position: 'relative',
        right: 0,
        zIndex: 10,
        backgroundColor: '#fee2e2', // Light red background for debugging
        border: '4px solid #ef4444' // Red border for visibility
      }}
    >
      <div className={`${isCompact ? 'p-2' : 'p-4'} border-b border-red-400 flex items-center justify-between bg-red-200`}>
        <h2 className={`font-medium text-red-800 ${isCompact ? 'text-xs' : 'text-sm'}`}>
          {isCompact ? 'DEBUG PANEL' : 'DEBUG Properties Panel'}
        </h2>
        {onToggle && !isCompact && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-8 h-8 p-0 bg-red-300 hover:bg-red-400"
            title="Hide Properties Panel"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      <div className="flex-1 bg-red-50 p-4">
        <div className="text-red-800 text-sm space-y-2">
          <div>✅ PANEL IS VISIBLE!</div>
          <div>Width: {panelWidth}px</div>
          <div>Layout: {panelLayout}</div>
          <div>Compact: {isCompact ? 'Yes' : 'No'}</div>
          <div>Active Tab: {activeTab}</div>
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
      </div>
    </aside>
  );
};

export default DesktopPropertiesPanel;
