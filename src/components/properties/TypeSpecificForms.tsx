
import React from 'react';
import { EnhancedNode } from '../../types/nodeTypes';
import AgentNodeForm from './forms/AgentNodeForm';
import ToolNodeForm from './forms/ToolNodeForm';
import FunctionNodeForm from './forms/FunctionNodeForm';
import ConditionalNodeForm from './forms/ConditionalNodeForm';
import ParallelNodeForm from './forms/ParallelNodeForm';
import StartEndNodeForm from './forms/StartEndNodeForm';

interface TypeSpecificFormsProps {
  selectedNode: EnhancedNode;
  onUpdateNode: (updates: Partial<EnhancedNode>) => void;
  onUpdateFunction: (updates: Partial<EnhancedNode['function']>) => void;
  onUpdateConfig: (updates: Partial<EnhancedNode['config']>) => void;
}

const TypeSpecificForms: React.FC<TypeSpecificFormsProps> = ({
  selectedNode,
  onUpdateNode,
  onUpdateFunction,
  onUpdateConfig
}) => {
  const renderTypeSpecificForm = () => {
    switch (selectedNode.type) {
      case 'agent':
        return (
          <AgentNodeForm
            node={selectedNode}
            onUpdateNode={onUpdateNode}
            onUpdateFunction={onUpdateFunction}
            onUpdateConfig={onUpdateConfig}
          />
        );
      case 'tool':
        return (
          <ToolNodeForm
            node={selectedNode}
            onUpdateNode={onUpdateNode}
            onUpdateFunction={onUpdateFunction}
            onUpdateConfig={onUpdateConfig}
          />
        );
      case 'function':
        return (
          <FunctionNodeForm
            node={selectedNode}
            onUpdateNode={onUpdateNode}
            onUpdateFunction={onUpdateFunction}
            onUpdateConfig={onUpdateConfig}
          />
        );
      case 'conditional':
        return (
          <ConditionalNodeForm
            node={selectedNode}
            onUpdateNode={onUpdateNode}
            onUpdateFunction={onUpdateFunction}
            onUpdateConfig={onUpdateConfig}
          />
        );
      case 'parallel':
        return (
          <ParallelNodeForm
            node={selectedNode}
            onUpdateNode={onUpdateNode}
            onUpdateFunction={onUpdateFunction}
            onUpdateConfig={onUpdateConfig}
          />
        );
      case 'start':
      case 'end':
        return (
          <StartEndNodeForm
            node={selectedNode}
            onUpdateNode={onUpdateNode}
            onUpdateFunction={onUpdateFunction}
            onUpdateConfig={onUpdateConfig}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {renderTypeSpecificForm()}
    </div>
  );
};

export default TypeSpecificForms;
