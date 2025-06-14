
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedNode } from '../../../types/nodeTypes';

interface FunctionNodeFormProps {
  node: EnhancedNode;
  onUpdateNode: (updates: Partial<EnhancedNode>) => void;
  onUpdateFunction: (updates: Partial<EnhancedNode['function']>) => void;
  onUpdateConfig: (updates: Partial<EnhancedNode['config']>) => void;
}

const FunctionNodeForm: React.FC<FunctionNodeFormProps> = ({
  node,
  onUpdateFunction
}) => {
  return (
    <div className="space-y-4">
      <h4 className="text-md font-medium text-gray-700">Function Configuration</h4>
      
      <div>
        <Label htmlFor="language" className="text-sm font-medium text-gray-700">Programming Language</Label>
        <Select defaultValue="python">
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="typescript">TypeScript</SelectItem>
            <SelectItem value="sql">SQL</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="function-code" className="text-sm font-medium text-gray-700">Function Code</Label>
        <Textarea
          id="function-code"
          className="mt-1 font-mono text-sm"
          placeholder="def main(input_data):&#10;    # Your function code here&#10;    return result"
          rows={8}
        />
      </div>

      <div>
        <Label htmlFor="requirements" className="text-sm font-medium text-gray-700">Dependencies</Label>
        <Textarea
          id="requirements"
          className="mt-1"
          placeholder="requests&#10;pandas&#10;numpy"
          rows={3}
        />
      </div>
    </div>
  );
};

export default FunctionNodeForm;
