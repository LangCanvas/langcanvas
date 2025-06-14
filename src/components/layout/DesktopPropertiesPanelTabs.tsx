
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EnhancedPropertiesPanel from '../EnhancedPropertiesPanel';
import ValidationPanel from '../ValidationPanel';
import PathfindingSettingsPanel from '../settings/PathfindingSettingsPanel';
import { EnhancedNode } from '../../types/nodeTypes';
import { EnhancedEdge } from '../../types/edgeTypes';
import { ValidationResult } from '../../hooks/useValidation';

interface DesktopPropertiesPanelTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedNode: EnhancedNode | null;
  selectedEdge: EnhancedEdge | null;
  allNodes: EnhancedNode[];
  allEdges: EnhancedEdge[];
  validationResult: ValidationResult;
  isCompact: boolean;
  onUpdateNode: (nodeId: string, updates: Partial<EnhancedNode>) => void;
  onUpdateEdge: (edgeId: string, updates: Partial<EnhancedEdge>) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  validatePriorityConflicts?: (nodeId: string, priority: number, currentEdgeId?: string) => { hasConflict: boolean; conflictingEdges: EnhancedEdge[] };
}

const DesktopPropertiesPanelTabs: React.FC<DesktopPropertiesPanelTabsProps> = ({
  activeTab,
  setActiveTab,
  selectedNode,
  selectedEdge,
  allNodes,
  allEdges,
  validationResult,
  isCompact,
  onUpdateNode,
  onUpdateEdge,
  onDeleteNode,
  onDeleteEdge,
  validatePriorityConflicts
}) => {
  const handleUpdateEdge = (edgeId: string, updates: Partial<EnhancedEdge>) => {
    console.log('🎛️ DesktopPropertiesPanel - Updating edge:', edgeId, updates);
    onUpdateEdge(edgeId, updates);
  };

  return (
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
  );
};

export default DesktopPropertiesPanelTabs;
