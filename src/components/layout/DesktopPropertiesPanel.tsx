
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle } from 'lucide-react';
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

  console.log('🚨 DEBUG - DesktopPropertiesPanel received isVisible:', {
    isVisible,
    willReturnNull: !isVisible,
    timestamp: new Date().toISOString()
  });

  const { activeTab, setActiveTab } = useDesktopPropertiesPanelState({
    selectedNode,
    selectedEdge,
    showValidationPanel,
    setShowValidationPanel,
    switchToPropertiesPanel
  });

  // Add DOM dimension checking
  React.useEffect(() => {
    const element = document.querySelector('[data-panel="desktop-properties"]');
    if (element) {
      const rect = element.getBoundingClientRect();
      console.log('🔍 VISUAL DEBUG - Panel actual dimensions:', {
        width: rect.width,
        height: rect.height,
        x: rect.x,
        y: rect.y,
        isVisible: rect.width > 0 && rect.height > 0,
        computedStyle: window.getComputedStyle(element),
        offsetParent: element.offsetParent
      });
    }
  });

  if (!isVisible) {
    console.log('🎛️ DesktopPropertiesPanel - Not visible, showing debug info instead of null');
    
    return (
      <aside 
        data-panel="desktop-properties-debug" 
        className="relative bg-red-50 border-l border-red-200 flex flex-col h-full flex-shrink-0 w-80"
        style={{ 
          backgroundColor: '#ff0000', 
          border: '5px solid #00ff00',
          zIndex: 9999,
          minWidth: '320px'
        }}
      >
        <div className="p-4 border-b border-red-200 flex items-center justify-between">
          <h2 className="font-medium text-red-800 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Panel Hidden (Debug)
          </h2>
          {onToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="w-8 h-8 p-0 text-red-600 hover:text-red-800"
              title="Show Properties Panel"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <div className="p-4 text-sm text-red-700 space-y-2">
          <p><strong>Panel State:</strong> isVisible = false</p>
          <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
          <p><strong>Panel Width:</strong> {panelWidth}px</p>
          <p><strong>Panel Layout:</strong> {panelLayout}</p>
          
          <div className="mt-4 p-3 bg-red-100 rounded border border-red-200">
            <p className="font-medium mb-2">Debug Actions:</p>
            <Button
              onClick={() => {
                console.log('🔧 Debug: Attempting to show panel via onToggle');
                onToggle?.();
              }}
              size="sm"
              className="mr-2 mb-2"
              variant="outline"
            >
              Force Show Panel
            </Button>
            <Button
              onClick={() => {
                console.log('🔧 Debug: Current window debug state:', (window as any).debugRightPanel?.getCurrentState());
                alert('Check console for debug information');
              }}
              size="sm"
              variant="outline"
            >
              Log Debug Info
            </Button>
          </div>
        </div>
      </aside>
    );
  }

  console.log('🎛️ DesktopPropertiesPanel - Continuing with render');

  // Always show expanded panel (no collapsed state)
  const isCompact = panelLayout === 'small';
  
  console.log('🎛️ DesktopPropertiesPanel - Rendering with layout:', {
    isCompact,
    panelLayout,
    activeTab
  });

  console.log('🎛️ DesktopPropertiesPanel - Rendering aside element');
  
  return (
    <aside 
      data-panel="desktop-properties" 
      className="relative bg-background border-l border-border flex flex-col h-full flex-shrink-0"
      style={{ 
        backgroundColor: '#ffff00', 
        border: '3px solid #ff0000',
        zIndex: 1000,
        minWidth: `${panelWidth}px`,
        width: `${panelWidth}px`
      }}
    >
      <div className={`${isCompact ? 'p-2' : 'p-4'} border-b border-border flex items-center justify-between`}>
        <h2 className={`font-medium text-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>
          🚨 DEBUG: {isCompact ? 'Panel' : 'Properties Panel'} ({panelWidth}px)
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
