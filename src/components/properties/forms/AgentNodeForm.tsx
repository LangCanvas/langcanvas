
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedNode } from '../../../types/nodeTypes';

interface AgentNodeFormProps {
  node: EnhancedNode;
  onUpdateNode: (updates: Partial<EnhancedNode>) => void;
  onUpdateFunction: (updates: Partial<EnhancedNode['function']>) => void;
  onUpdateConfig: (updates: Partial<EnhancedNode['config']>) => void;
}

const AgentNodeForm: React.FC<AgentNodeFormProps> = ({
  node,
  onUpdateFunction,
  onUpdateConfig
}) => {
  return (
    <div className="space-y-4">
      <h4 className="text-md font-medium text-gray-700">Agent Configuration</h4>
      
      <div>
        <Label htmlFor="model" className="text-sm font-medium text-gray-700">AI Model</Label>
        <Select 
          value={node.config.metadata.tags.find(tag => tag.startsWith('model:'))?.replace('model:', '') || 'gpt-4'}
          onValueChange={(value) => {
            const newTags = node.config.metadata.tags.filter(tag => !tag.startsWith('model:'));
            newTags.push(`model:${value}`);
            onUpdateConfig({
              metadata: { ...node.config.metadata, tags: newTags }
            });
          }}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select AI model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4">GPT-4</SelectItem>
            <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
            <SelectItem value="claude-3">Claude 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="system-prompt" className="text-sm font-medium text-gray-700">System Prompt</Label>
        <Textarea
          id="system-prompt"
          value={node.config.metadata.notes}
          onChange={(e) => onUpdateConfig({
            metadata: { ...node.config.metadata, notes: e.target.value }
          })}
          className="mt-1"
          placeholder="Define the agent's role and behavior..."
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="temperature" className="text-sm font-medium text-gray-700">Temperature</Label>
        <Input
          id="temperature"
          type="number"
          min="0"
          max="2"
          step="0.1"
          defaultValue="0.7"
          className="mt-1"
          placeholder="0.0 - 2.0"
        />
      </div>

      <div>
        <Label htmlFor="max-tokens" className="text-sm font-medium text-gray-700">Max Tokens</Label>
        <Input
          id="max-tokens"
          type="number"
          min="1"
          max="4096"
          defaultValue="1000"
          className="mt-1"
          placeholder="Maximum response length"
        />
      </div>
    </div>
  );
};

export default AgentNodeForm;
