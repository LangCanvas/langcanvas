
import React, { useState, useEffect } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { validateNodeConfiguration } from '../utils/nodeDefaults';
import ValidationErrorsDisplay from './properties/ValidationErrorsDisplay';
import BasicPropertiesForm from './properties/BasicPropertiesForm';
import InputSchemaEditor from './properties/InputSchemaEditor';
import AdvancedConfigurationForm from './properties/AdvancedConfigurationForm';
import NodeDeleteButton from './properties/NodeDeleteButton';

interface EnhancedPropertiesPanelProps {
  selectedNode: EnhancedNode | null;
  onUpdateNode: (nodeId: string, updates: Partial<EnhancedNode>) => void;
  onDeleteNode: (nodeId: string) => void;
}

const EnhancedPropertiesPanel: React.FC<EnhancedPropertiesPanelProps> = ({
  selectedNode,
  onUpdateNode,
  onDeleteNode
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (selectedNode) {
      const validation = validateNodeConfiguration(selectedNode);
      setValidationErrors(validation.errors);
    }
  }, [selectedNode]);

  if (!selectedNode) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>Select a node to view its properties</p>
      </div>
    );
  }

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
};

export default EnhancedPropertiesPanel;
