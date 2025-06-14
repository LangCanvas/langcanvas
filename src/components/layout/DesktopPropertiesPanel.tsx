
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
  const [activeTab, setActiveTab] = useState('properties');

  // Smart switching: when user selects a node/edge while validation panel is showing
  useEffect(() => {
    if ((selectedNode || selectedEdge) && showValidationPanel && switchToPropertiesPanel) {
      switchToPropertiesPanel();
    }
  }, [selectedNode, selectedEdge, showValidationPanel, switchToPropertiesPanel]);

  // Auto-switch to validation tab when there are issues and user clicks on validation
  useEffect(() => {
    if (showValidationPanel) {
      setActiveTab('validation');
      setShowValidationPanel(false); // Reset the flag
    }
  }, [showValidationPanel, setShowValidationPanel]);

  const handleUpdateEdge = (edgeId: string, updates: Partial<EnhancedEdge>) => {
    onUpdateEdge(edgeId, updates);
  };

  // If not visible, don't render anything
  if (!isVisible) {
    return null;
  }

  // Always show expanded panel (no collapsed state)
  const isCompact = panelLayout === 'compact';
  
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
          <div className={isCompact ? 'p-2' : 'p-4'}>
            <ValidationPanel 
              validationResult={validationResult}
              compact={isCompact}
            />
          </div>
        </TabsContent>

        <TabsContent value="settings" className="flex-1 mt-0">
          <div className={isCompact ? 'p-2' : 'p-4'}>
            <PathfindingSettingsPanel 
              nodes={allNodes}
              edges={allEdges}
              className="border-0 shadow-none"
            />
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
};

export default DesktopPropertiesPanel;
