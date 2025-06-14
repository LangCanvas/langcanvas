
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedNode } from '../../../types/nodeTypes';

interface ConditionalNodeFormProps {
  node: EnhancedNode;
  onUpdateNode: (updates: Partial<EnhancedNode>) => void;
  onUpdateFunction: (updates: Partial<EnhancedNode['function']>) => void;
  onUpdateConfig: (updates: Partial<EnhancedNode['config']>) => void;
}

const ConditionalNodeForm: React.FC<ConditionalNodeFormProps> = ({
  node,
  onUpdateConfig
}) => {
  return (
    <div className="space-y-4">
      <h4 className="text-md font-medium text-gray-700">Conditional Configuration</h4>
      
      <div>
        <Label htmlFor="evaluation-mode" className="text-sm font-medium text-gray-700">Evaluation Mode</Label>
        <Select 
          value={node.config.conditional?.evaluationMode || 'first-match'}
          onValueChange={(value) => onUpdateConfig({
            conditional: { 
              ...node.config.conditional,
              evaluationMode: value as any
            }
          })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="first-match">First Match</SelectItem>
            <SelectItem value="all-matches">All Matches</SelectItem>
            <SelectItem value="priority-based">Priority Based</SelectItem>
            <SelectItem value="conditional-entrypoint">Conditional Entrypoint</SelectItem>
            <SelectItem value="parallel-conditional">Parallel Conditional</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="default-condition" className="text-sm font-medium text-gray-700">Default Condition</Label>
        <Input
          id="default-condition"
          className="mt-1"
          placeholder="true"
          defaultValue="true"
        />
      </div>

      <div>
        <Label htmlFor="condition-description" className="text-sm font-medium text-gray-700">Condition Logic Description</Label>
        <Textarea
          id="condition-description"
          className="mt-1"
          placeholder="Describe the conditions and their logic..."
          rows={3}
        />
      </div>
    </div>
  );
};

export default ConditionalNodeForm;
