
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedNode, NodeType } from '../../types/nodeTypes';

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
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Basic Properties</h3>
      
      <div>
        <Label htmlFor="label" className="text-sm font-medium text-gray-700">Label</Label>
        <Input
          id="label"
          value={selectedNode.label}
          onChange={(e) => onUpdateNode({ label: e.target.value })}
          className="mt-1"
          placeholder="Enter node label"
        />
      </div>

      <div>
        <Label htmlFor="type" className="text-sm font-medium text-gray-700">Node Type</Label>
        <Select value={selectedNode.type} onValueChange={(value: NodeType) => onUpdateNode({ type: value })}>
          <SelectTrigger className="mt-1">
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

      <div>
        <Label htmlFor="function-name" className="text-sm font-medium text-gray-700">Function Name</Label>
        <Input
          id="function-name"
          value={selectedNode.function.name}
          onChange={(e) => onUpdateFunction({ name: e.target.value })}
          className="mt-1"
          placeholder="Enter function name"
        />
      </div>
    </div>
  );
};

export default BasicPropertiesForm;
