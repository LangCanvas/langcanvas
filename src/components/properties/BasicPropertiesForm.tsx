
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedNode, NodeType } from '../../types/nodeTypes';
import { useRealTimeFormValidation } from '../../hooks/useRealTimeFormValidation';
import EnhancedFormField from './EnhancedFormField';
import CollapsibleFormSection from './CollapsibleFormSection';

interface BasicPropertiesFormProps {
  selectedNode: EnhancedNode;
  onUpdateNode: (updates: Partial<EnhancedNode>) => void;
  onUpdateFunction: (updates: Partial<EnhancedNode['function']>) => void;
}

const BasicPropertiesForm: React.FC<BasicPropertiesFormProps> = ({
  selectedNode,
  onUpdateNode,
  onUpdateFunction
}) => {
  const validationRules = [
    {
      field: 'label',
      validator: (value: string) => {
        if (!value?.trim()) {
          return { isValid: false, message: 'Label is required' };
        }
        if (value.length < 2) {
          return { isValid: false, message: 'Label must be at least 2 characters' };
        }
        if (value.length > 50) {
          return { isValid: false, message: 'Label must be less than 50 characters' };
        }
        return { isValid: true };
      }
    },
    {
      field: 'function.name',
      validator: (value: string) => {
        if (!value?.trim()) {
          return { isValid: false, message: 'Function name is required' };
        }
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
          return { isValid: false, message: 'Function name must be a valid identifier' };
        }
        if (value.length > 30) {
          return { isValid: false, message: 'Function name must be less than 30 characters' };
        }
        return { isValid: true };
      }
    }
  ];

  const { getFieldValidation, isFormValid } = useRealTimeFormValidation(selectedNode, validationRules);

  const labelValidation = getFieldValidation('label');
  const functionNameValidation = getFieldValidation('function.name');

  return (
    <div className="space-y-6">
      <CollapsibleFormSection 
        title="Basic Properties" 
        description="Core node configuration"
        variant="accent"
      >
        <EnhancedFormField
          label="Label"
          value={selectedNode.label}
          onChange={(value) => onUpdateNode({ label: value })}
          placeholder="Enter node label"
          description="A descriptive name for this node"
          error={!labelValidation.isValid ? labelValidation.error : undefined}
          warning={labelValidation.warning}
          success={labelValidation.isValid && selectedNode.label.length > 0}
          required
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Node Type</label>
          <Select value={selectedNode.type} onValueChange={(value: NodeType) => onUpdateNode({ type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select node type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="start">Start</SelectItem>
              <SelectItem value="agent">Agent</SelectItem>
              <SelectItem value="tool">Tool</SelectItem>
              <SelectItem value="function">Function</SelectItem>
              <SelectItem value="conditional">Conditional</SelectItem>
              <SelectItem value="parallel">Parallel</SelectItem>
              <SelectItem value="end">End</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <EnhancedFormField
          label="Function Name"
          value={selectedNode.function.name}
          onChange={(value) => onUpdateFunction({ name: value })}
          placeholder="Enter function name"
          description="The name of the function this node will execute"
          error={!functionNameValidation.isValid ? functionNameValidation.error : undefined}
          warning={functionNameValidation.warning}
          success={functionNameValidation.isValid && selectedNode.function.name.length > 0}
          required
        />
      </CollapsibleFormSection>

      {!isFormValid && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-sm text-orange-800 font-medium">Form has validation errors</span>
          </div>
          <p className="text-xs text-orange-700 mt-1">Please fix the highlighted fields above.</p>
        </div>
      )}
    </div>
  );
};

export default BasicPropertiesForm;
