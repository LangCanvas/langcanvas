
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import NodePalette from '../NodePalette';
import EnhancedPropertiesPanel from '../EnhancedPropertiesPanel';
import { ValidationResult } from '../../hooks/useValidation';
import { EnhancedNode } from '../../types/nodeTypes';
import { EnhancedEdge } from '../../types/edgeTypes';

interface MobilePanelOverlayProps {
  activePanel: 'palette' | 'properties' | null;
  onClose: () => void;
  onPanelToggle: (panel: 'palette' | 'properties') => void;
  selectedNode: EnhancedNode | null;
  selectedEdge: EnhancedEdge | null;
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  onUpdateNodeProperties: (nodeId: string, updates: Partial<EnhancedNode>) => void;
  onUpdateEdgeProperties: (edgeId: string, updates: Partial<EnhancedEdge>) => void;
  allNodes: EnhancedNode[];
  allEdges: EnhancedEdge[];
  validationResult: ValidationResult;
  showValidationPanel: boolean;
  setShowValidationPanel: (show: boolean) => void;
  validatePriorityConflicts?: (nodeId: string, priority: number, currentEdgeId?: string) => { hasConflict: boolean; conflictingEdges: EnhancedEdge[] };
}

const MobilePanelOverlay: React.FC<MobilePanelOverlayProps> = ({
  activePanel,
  onClose,
  onPanelToggle,
  selectedNode,
  selectedEdge,
  onDeleteNode,
  onDeleteEdge,
  onUpdateNodeProperties,
  onUpdateEdgeProperties,
  allNodes,
  allEdges,
  validationResult,
  showValidationPanel,
  setShowValidationPanel,
  validatePriorityConflicts
}) => {
  if (!activePanel) return null;

  return (
    <div 
      className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30" 
      onClick={onClose}
      style={{ touchAction: 'none' }}
    >
      <div 
        className="absolute bottom-0 left-0 right-0 h-1/2 bg-white rounded-t-lg transform transition-transform overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              {activePanel === 'palette' ? 'Node Palette' : 'Properties'}
            </h2>
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onPanelToggle(activePanel === 'palette' ? 'properties' : 'palette')}
                className="touch-manipulation"
                style={{ minHeight: '44px' }}
              >
                {activePanel === 'palette' ? 'Properties' : 'Palette'}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="touch-manipulation"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          {activePanel === 'palette' && (
            <NodePalette onNodeTypeSelect={(type) => {
              const event = new CustomEvent('setPendingCreation', { detail: type });
              window.dispatchEvent(event);
            }} />
          )}
          {activePanel === 'properties' && (
            <EnhancedPropertiesPanel 
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              allNodes={allNodes}
              allEdges={allEdges}
              onUpdateNode={onUpdateNodeProperties}
              onUpdateEdge={onUpdateEdgeProperties}
              onDeleteNode={onDeleteNode}
              onDeleteEdge={onDeleteEdge}
              validatePriorityConflicts={validatePriorityConflicts}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MobilePanelOverlay;
