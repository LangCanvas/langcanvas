
import React, { useState, useEffect } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { Edge } from '../hooks/useEdges';
import { validateNodeConfiguration } from '../utils/nodeDefaults';
import ValidationErrorsDisplay from './properties/ValidationErrorsDisplay';
import BasicPropertiesForm from './properties/BasicPropertiesForm';
import InputSchemaEditor from './properties/InputSchemaEditor';
import AdvancedConfigurationForm from './properties/AdvancedConfigurationForm';
import NodeDeleteButton from './properties/NodeDeleteButton';
import EdgePropertiesForm from './properties/EdgePropertiesForm';

interface EnhancedPropertiesPanelProps {
  selectedNode: EnhancedNode | null;
  selectedEdge: Edge | null;
  allNodes: EnhancedNode[];
  onUpdateNode: (nodeId: string, updates: Partial<EnhancedNode>) => void;
  onUpdateEdge: (edgeId: string, updates: Partial<Edge>) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
}

const EnhancedPropertiesPanel: React.FC<EnhancedPropertiesPanelProps> = ({
  selectedNode,
  selectedEdge,
  allNodes,
  onUpdateNode,
  onUpdateEdge,
  onDeleteNode,
  onDeleteEdge
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (selectedNode) {
      const validation = validateNodeConfiguration(selectedNode);
      setValidationErrors(validation.errors);
    } else {
      setValidationErrors([]);
    }
  }, [selectedNode]);

  // Show edge properties if an edge is selected
  if (selectedEdge) {
    return (
      <div className="p-4 space-y-6 max-h-full overflow-y-auto">
        <EdgePropertiesForm
          selectedEdge={selectedEdge}
          nodes={allNodes}
          onUpdateEdge={onUpdateEdge}
          onDeleteEdge={onDeleteEdge}
        />
      </div>
    );
  }

  // Show node properties if a node is selected
  if (selectedNode) {
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
      <div className="p-4 space-y-6 max-h-full overflow-y-auto">
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
    );
  }

  // Default state when nothing is selected
  return (
    <div className="p-4 text-center text-gray-500">
      <p>Select a node or edge to view its properties</p>
    </div>
  );
};

export default EnhancedPropertiesPanel;
