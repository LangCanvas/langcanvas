
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { EnhancedNode } from '../../../types/nodeTypes';

interface ParallelNodeFormProps {
  node: EnhancedNode;
  onUpdateNode: (updates: Partial<EnhancedNode>) => void;
  onUpdateFunction: (updates: Partial<EnhancedNode['function']>) => void;
  onUpdateConfig: (updates: Partial<EnhancedNode['config']>) => void;
}

const ParallelNodeForm: React.FC<ParallelNodeFormProps> = ({
  node,
  onUpdateConfig
}) => {
  return (
    <div className="space-y-4">
      <h4 className="text-md font-medium text-gray-700">Parallel Execution Configuration</h4>
      
      <div>
        <Label htmlFor="execution-strategy" className="text-sm font-medium text-gray-700">Execution Strategy</Label>
        <Select 
          value={node.config.concurrency}
          onValueChange={(value: 'parallel' | 'sequential') => onUpdateConfig({ concurrency: value })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="parallel">Full Parallel</SelectItem>
            <SelectItem value="sequential">Sequential</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="max-concurrent" className="text-sm font-medium text-gray-700">Max Concurrent Executions</Label>
        <Input
          id="max-concurrent"
          type="number"
          min="1"
          max="10"
          defaultValue="3"
          className="mt-1"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch defaultChecked />
        <Label className="text-sm font-medium text-gray-700">Wait for All Branches</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch />
        <Label className="text-sm font-medium text-gray-700">Fail Fast on Error</Label>
      </div>
    </div>
  );
};

export default ParallelNodeForm;
