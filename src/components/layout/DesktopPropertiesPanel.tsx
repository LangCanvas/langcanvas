import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PanelRightClose } from 'lucide-react';
import EnhancedPropertiesPanel from '../EnhancedPropertiesPanel';
import ValidationPanel from '../ValidationPanel';
import PathfindingSettingsPanel from '../settings/PathfindingSettingsPanel';
import CollapsedPropertiesPanel from './CollapsedPropertiesPanel';
import { EnhancedNode } from '../../types/nodeTypes';
import { EnhancedEdge } from '../../types/edgeTypes';
import { ValidationResult } from '../../hooks/useValidation';

interface DesktopPropertiesPanelProps {
  selectedNode: EnhancedNode | null;
  selectedEdge: EnhancedEdge | null;
  allNodes: EnhancedNode[];
  allEdges: EnhancedEdge[];
  validationResult: ValidationResult;
  showValidationPanel: boolean;
  isVisible?: boolean;
  isExpanded?: boolean;
  
  onUpdateNode: (nodeId: string, updates: Partial<EnhancedNode>) => void;
  onUpdateEdge: (edgeId: string, updates: Partial<EnhancedEdge>) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  setShowValidationPanel: (show: boolean) => void;
  onExpand?: () => void;
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
  onUpdateNode,
  onUpdateEdge,
  onDeleteNode,
  onDeleteEdge,
  setShowValidationPanel,
  onExpand,
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

  // Debug logging
  useEffect(() => {
    console.log('🎛️ DesktopPropertiesPanel render state:', {
      isVisible,
      isExpanded,
      onExpand: !!onExpand,
      onToggle: !!onToggle
    });
  }, [isVisible, isExpanded, onExpand, onToggle]);

  const handleUpdateEdge = (edgeId: string, updates: Partial<EnhancedEdge>) => {
    onUpdateEdge(edgeId, updates);
  };

  const handleExpand = () => {
    console.log('🎛️ CollapsedPropertiesPanel expand clicked');
    if (onExpand) {
      onExpand();
    }
  };

  // If not visible, don't render anything
  if (!isVisible) {
    console.log('🎛️ DesktopPropertiesPanel not visible, returning null');
    return null;
  }

  // Show collapsed panel when not expanded
  if (!isExpanded) {
    console.log('🎛️ DesktopPropertiesPanel rendering collapsed state');
    return (
      <aside 
        data-panel="desktop-properties" 
        className="relative bg-background border-l border-border flex flex-col w-14 flex-shrink-0 z-10"
        style={{ minWidth: '3.5rem', width: '3.5rem' }}
      >
        <CollapsedPropertiesPanel
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          validationResult={validationResult}
          onExpand={handleExpand}
        />
      </aside>
    );
  }

  // Show expanded panel with tabs
  console.log('🎛️ DesktopPropertiesPanel rendering expanded state');
  return (
    <aside 
      data-panel="desktop-properties" 
      className="relative w-80 bg-background border-l border-border flex flex-col flex-shrink-0"
    >
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground">Panel</h2>
        {onToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-8 h-8 p-0"
            title="Collapse Properties Panel"
          >
            <PanelRightClose className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-4 pt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="properties" className="text-xs">
              Properties
            </TabsTrigger>
            <TabsTrigger value="validation" className="text-xs">
              Issues
              {validationResult.issues.length > 0 && (
                <span className="ml-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {validationResult.issues.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">
              Settings
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
          <div className="p-4">
            <ValidationPanel 
              validationResult={validationResult}
              compact={false}
            />
          </div>
        </TabsContent>

        <TabsContent value="settings" className="flex-1 mt-0">
          <div className="p-4">
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
