
import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EnhancedNode } from '../types/nodeTypes';
import { EnhancedEdge } from '../types/edgeTypes';
import { validateNodeConfiguration } from '../utils/nodeDefaults';
import ValidationErrorsDisplay from './properties/ValidationErrorsDisplay';
import BasicPropertiesForm from './properties/BasicPropertiesForm';
import InputSchemaEditor from './properties/InputSchemaEditor';
import AdvancedConfigurationForm from './properties/AdvancedConfigurationForm';
import NodeDeleteButton from './properties/NodeDeleteButton';
import EdgePropertiesForm from './properties/EdgePropertiesForm';
import ConditionalEdgePropertiesForm from './properties/ConditionalEdgePropertiesForm';

interface EnhancedPropertiesPanelProps {
  selectedNode: EnhancedNode | null;
  selectedEdge: EnhancedEdge | null;
  allNodes: EnhancedNode[];
  allEdges: EnhancedEdge[];
  onUpdateNode: (nodeId: string, updates: Partial<EnhancedNode>) => void;
  onUpdateEdge: (edgeId: string, updates: Partial<EnhancedEdge>) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  validatePriorityConflicts?: (nodeId: string, priority: number, currentEdgeId?: string) => { hasConflict: boolean; conflictingEdges: EnhancedEdge[] };
}

const EnhancedPropertiesPanel: React.FC<EnhancedPropertiesPanelProps> = ({
  selectedNode,
  selectedEdge,
  allNodes,
  allEdges,
  onUpdateNode,
  onUpdateEdge,
  onDeleteNode,
  onDeleteEdge,
  validatePriorityConflicts
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    console.log(`🎛️ PropertiesPanel - Node: ${selectedNode?.id || 'null'}, Edge: ${selectedEdge?.id || 'null'}`);
  }, [selectedNode, selectedEdge]);

  useEffect(() => {
    if (selectedNode) {
      const validation = validateNodeConfiguration(selectedNode);
      setValidationErrors(validation.errors);
    } else {
      setValidationErrors([]);
    }
  }, [selectedNode]);

  useEffect(() => {
    setShowAdvanced(false);
  }, [selectedNode?.id, selectedEdge?.id]);

  if (selectedEdge) {
    console.log(`🔗 Rendering edge properties for edge: ${selectedEdge.id}`);
    
    if (selectedEdge.conditional) {
      const allConditionalEdges = allEdges.filter(edge => edge.conditional);
      
      return (
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            <ConditionalEdgePropertiesForm
              selectedEdge={selectedEdge}
              nodes={allNodes}
              allConditionalEdges={allConditionalEdges}
              onUpdateEdge={onUpdateEdge}
              onUpdateEdgeCondition={(edgeId, condition) => {
                const currentEdge = selectedEdge;
                if (currentEdge.conditional) {
                  onUpdateEdge(edgeId, {
                    conditional: {
                      ...currentEdge.conditional,
                      condition: { ...currentEdge.conditional.condition, ...condition }
                    },
                    label: condition.functionName || currentEdge.label
                  });
                }
              }}
              onDeleteEdge={onDeleteEdge}
              onReorderEdges={(nodeId, edgeIds) => {
                console.log('Reorder edges for node:', nodeId, edgeIds);
              }}
              onUpdateNode={onUpdateNode}
              validatePriorityConflicts={validatePriorityConflicts || (() => ({ hasConflict: false, conflictingEdges: [] }))}
            />
          </div>
        </ScrollArea>
      );
    } else {
      return (
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            <EdgePropertiesForm
              selectedEdge={selectedEdge}
              nodes={allNodes}
              onUpdateEdge={onUpdateEdge}
              onDeleteEdge={onDeleteEdge}
            />
          </div>
        </ScrollArea>
      );
    }
  }

  if (selectedNode && !selectedEdge) {
    console.log(`🎯 Rendering node properties for node: ${selectedNode.id}`);
    
    const updateNode = (updates: Partial<EnhancedNode>) => {
      onUpdateNode(selectedNode.id, updates);
    };

    const updateFunction = (updates: Partial<EnhancedNode['function']>) => {
      updateNode({
        function: { ...selectedNode.function, ...updates }
      });
    };

    const updateConfig = (updates: Partial<EnhancedNode['config']>) => {
      updateNode({
        config: { ...selectedNode.config, ...updates }
      });
    };

    const handleDeleteNode = () => {
      onDeleteNode(selectedNode.id);
    };

    const toggleAdvanced = () => {
      setShowAdvanced(!showAdvanced);
    };

    return (
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <ValidationErrorsDisplay errors={validationErrors} />
          
          <BasicPropertiesForm 
            selectedNode={selectedNode}
            onUpdateNode={updateNode}
            onUpdateFunction={updateFunction}
          />

          <InputSchemaEditor 
            selectedNode={selectedNode}
            onUpdateFunction={updateFunction}
          />

          <AdvancedConfigurationForm 
            selectedNode={selectedNode}
            showAdvanced={showAdvanced}
            onToggleAdvanced={toggleAdvanced}
            onUpdateConfig={updateConfig}
          />

          <NodeDeleteButton onDeleteNode={handleDeleteNode} />
        </div>
      </ScrollArea>
    );
  }

  console.log('📄 Rendering default properties panel state');
  return (
    <div className="p-4 text-center text-gray-500">
      <p>Select a node or edge to view its properties</p>
    </div>
  );
};

export default EnhancedPropertiesPanel;
