
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EnhancedNode } from '../../../types/nodeTypes';

interface StartEndNodeFormProps {
  node: EnhancedNode;
  onUpdateNode: (updates: Partial<EnhancedNode>) => void;
  onUpdateFunction: (updates: Partial<EnhancedNode['function']>) => void;
  onUpdateConfig: (updates: Partial<EnhancedNode['config']>) => void;
}

const StartEndNodeForm: React.FC<StartEndNodeFormProps> = ({
  node,
  onUpdateNode,
  onUpdateConfig
}) => {
  return (
    <div className="space-y-4">
      <h4 className="text-md font-medium text-gray-700">
        {node.type === 'start' ? 'Start Node Configuration' : 'End Node Configuration'}
      </h4>
      
      <div>
        <Label htmlFor="node-description" className="text-sm font-medium text-gray-700">Description</Label>
        <Textarea
          id="node-description"
          value={node.config.metadata.notes}
          onChange={(e) => onUpdateConfig({
            metadata: { ...node.config.metadata, notes: e.target.value }
          })}
          className="mt-1"
          placeholder={`Describe what this ${node.type} node represents...`}
          rows={3}
        />
      </div>

      {node.type === 'start' && (
        <div>
          <Label htmlFor="trigger-type" className="text-sm font-medium text-gray-700">Trigger Type</Label>
          <Input
            id="trigger-type"
            className="mt-1"
            placeholder="manual, scheduled, webhook, etc."
          />
        </div>
      )}

      {node.type === 'end' && (
        <div>
          <Label htmlFor="output-format" className="text-sm font-medium text-gray-700">Output Format</Label>
          <Input
            id="output-format"
            className="mt-1"
            placeholder="json, text, file, etc."
          />
        </div>
      )}
    </div>
  );
};

export default StartEndNodeForm;
