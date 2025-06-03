import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import NodePalette from '../NodePalette';
import PropertiesPanel from '../PropertiesPanel';
import { ValidationResult } from '../../utils/graphValidation';

interface MobilePanelOverlayProps {
  activePanel: 'palette' | 'properties' | null;
  onClose: () => void;
  onPanelToggle: (panel: 'palette' | 'properties') => void;
  selectedNode: any;
  selectedEdge: any;
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  onUpdateNodeProperties: (nodeId: string, updates: any) => void;
  onUpdateEdgeProperties: (edgeId: string, updates: any) => void;
  allNodes: any[];
  nodeOutgoingEdges: any[];
  validationResult: ValidationResult;
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
  nodeOutgoingEdges,
  validationResult
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
          {activePanel === 'palette' && <NodePalette />}
          {activePanel === 'properties' && (
            <PropertiesPanel 
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              onDeleteNode={onDeleteNode}
              onDeleteEdge={onDeleteEdge}
              onUpdateNodeProperties={onUpdateNodeProperties}
              onUpdateEdgeProperties={onUpdateEdgeProperties}
              allNodes={allNodes}
              nodeOutgoingEdges={nodeOutgoingEdges}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MobilePanelOverlay;
