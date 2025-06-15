
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
  console.log('🎛️ DesktopPropertiesPanel - Render with debug styling:', {
    selectedNode: selectedNode?.id || 'none',
    selectedEdge: selectedEdge?.id || 'none',
    isVisible,
    panelWidth,
    panelLayout
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

  const isCompact = panelLayout === 'small';
  
  return (
    <aside 
      data-panel="desktop-properties" 
      className="h-full w-full bg-purple-300 border-8 border-purple-800 flex flex-col"
      style={{ 
        minWidth: `${panelWidth}px`,
        width: `${panelWidth}px`,
        maxWidth: `${panelWidth}px`,
        position: 'relative',
        zIndex: 10
      }}
    >
      <div className={`${isCompact ? 'p-2' : 'p-4'} border-b border-purple-600 flex items-center justify-between bg-purple-400`}>
        <h2 className={`font-bold text-purple-900 ${isCompact ? 'text-sm' : 'text-lg'}`}>
          🎛️ PROPERTIES PANEL VISIBLE! 
        </h2>
        {onToggle && !isCompact && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-8 h-8 p-0 bg-purple-500 hover:bg-purple-600 text-white"
            title="Hide Properties Panel"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      <div className="flex-1 bg-purple-200 p-4 overflow-auto">
        <div className="text-purple-900 text-sm space-y-2 font-bold">
          <div>✅ RIGHT PANEL IS NOW VISIBLE!</div>
          <div>Width: {panelWidth}px</div>
          <div>Layout: {panelLayout}</div>
          <div>Compact: {isCompact ? 'Yes' : 'No'}</div>
          <div>Active Tab: {activeTab}</div>
          <div>Selected Node: {selectedNode?.id || 'None'}</div>
          <div>Selected Edge: {selectedEdge?.id || 'None'}</div>
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
