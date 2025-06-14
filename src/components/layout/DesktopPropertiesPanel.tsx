
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import EnhancedPropertiesPanel from '../EnhancedPropertiesPanel';
import ValidationPanel from '../ValidationPanel';
import PathfindingSettingsPanel from '../settings/PathfindingSettingsPanel';
import { EnhancedNode } from '../../types/nodeTypes';
import { EnhancedEdge } from '../../types/edgeTypes';
import { ValidationResult } from '../../hooks/useValidation';
import { PanelLayout } from '../../hooks/useAdaptivePanelWidths';

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
  panelLayout?: PanelLayout;
  
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
  panelLayout = 'standard',
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

  const [activeTab, setActiveTab] = useState('properties');

  // Smart switching: when user selects a node/edge while validation panel is showing
  useEffect(() => {
    if ((selectedNode || selectedEdge) && showValidationPanel && switchToPropertiesPanel) {
      console.log('🎛️ DesktopPropertiesPanel - Smart switching to properties tab');
      switchToPropertiesPanel();
    }
  }, [selectedNode, selectedEdge, showValidationPanel, switchToPropertiesPanel]);

  // Auto-switch to validation tab when there are issues and user clicks on validation
  useEffect(() => {
    if (showValidationPanel) {
      console.log('🎛️ DesktopPropertiesPanel - Auto-switching to validation tab');
      setActiveTab('validation');
      setShowValidationPanel(false); // Reset the flag
    }
  }, [showValidationPanel, setShowValidationPanel]);

  const handleUpdateEdge = (edgeId: string, updates: Partial<EnhancedEdge>) => {
    console.log('🎛️ DesktopPropertiesPanel - Updating edge:', edgeId, updates);
    onUpdateEdge(edgeId, updates);
  };

  // If not visible, don't render anything
  if (!isVisible) {
    console.log('🎛️ DesktopPropertiesPanel - Not visible, returning null');
    return null;
  }

  console.log('🎛️ DesktopPropertiesPanel - Continuing with render');

  // Always show expanded panel (no collapsed state)
  const isCompact = panelLayout === 'compact';
  
  console.log('🎛️ DesktopPropertiesPanel - Rendering with layout:', {
    isCompact,
    panelLayout,
    activeTab
  });

  // Add DOM element verification
  useEffect(() => {
    const element = document.querySelector('[data-panel="desktop-properties"]');
    console.log('🎛️ DesktopPropertiesPanel - DOM element check:', {
      elementExists: !!element,
      element,
      timestamp: new Date().toISOString()
    });
  });

  console.log('🎛️ DesktopPropertiesPanel - Rendering aside element');
  
  return (
    <aside 
      data-panel="desktop-properties" 
      className="relative bg-background border-l border-border flex flex-col h-full flex-shrink-0"
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className={`${isCompact ? 'px-2 pt-1' : 'px-4 pt-2'}`}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="properties" className={isCompact ? 'text-xs px-1' : 'text-xs'}>
              {isCompact ? 'Props' : 'Properties'}
            </TabsTrigger>
            <TabsTrigger value="validation" className={isCompact ? 'text-xs px-1' : 'text-xs'}>
              {isCompact ? 'Issues' : 'Issues'}
              {validationResult.issues.length > 0 && (
                <span className={`ml-1 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center ${isCompact ? 'w-4 h-4' : 'w-5 h-5'}`}>
                  {validationResult.issues.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" className={isCompact ? 'text-xs px-1' : 'text-xs'}>
              {isCompact ? 'Set' : 'Settings'}
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="properties" className="flex-1 mt-0">
          {(() => {
            console.log('🎛️ DesktopPropertiesPanel - Rendering properties tab content');
            return null;
          })()}
          <EnhancedPropertiesPanel 
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            allNodes={allNodes}
            allEdges={allEdges}
            onUpdateNode={onUpdateNode}
            onUpdateEdge={handleUpdateEdge}
            onDeleteNode={onDeleteNode}
            onDeleteEdge={onDeleteEdge}
            validatePriorityConflicts={validatePriorityConflicts}
          />
        </TabsContent>
        
        <TabsContent value="validation" className="flex-1 mt-0">
          {(() => {
            console.log('🎛️ DesktopPropertiesPanel - Rendering validation tab content');
            return null;
          })()}
          <div className={isCompact ? 'p-2' : 'p-4'}>
            <ValidationPanel 
              validationResult={validationResult}
              compact={isCompact}
            />
          </div>
        </TabsContent>

        <TabsContent value="settings" className="flex-1 mt-0">
          {(() => {
            console.log('🎛️ DesktopPropertiesPanel - Rendering settings tab content');
            return null;
          })()}
          <div className={isCompact ? 'p-2' : 'p-4'}>
            <PathfindingSettingsPanel 
              nodes={allNodes}
              edges={allEdges}
              className="border-0 shadow-none"
            />
          </div>
        </TabsContent>
      </Tabs>
      
      {(() => {
        console.log('🎛️ DesktopPropertiesPanel - Render completed successfully');
        return null;
      })()}
    </aside>
  );
};

export default DesktopPropertiesPanel;
