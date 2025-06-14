
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { EnhancedNode } from '../../../types/nodeTypes';

interface ToolNodeFormProps {
  node: EnhancedNode;
  onUpdateNode: (updates: Partial<EnhancedNode>) => void;
  onUpdateFunction: (updates: Partial<EnhancedNode['function']>) => void;
  onUpdateConfig: (updates: Partial<EnhancedNode['config']>) => void;
}

const ToolNodeForm: React.FC<ToolNodeFormProps> = ({
  node,
  onUpdateFunction,
  onUpdateConfig
}) => {
  return (
    <div className="space-y-4">
      <h4 className="text-md font-medium text-gray-700">Tool Configuration</h4>
      
      <div>
        <Label htmlFor="tool-type" className="text-sm font-medium text-gray-700">Tool Type</Label>
        <Select defaultValue="api">
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select tool type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="api">API Endpoint</SelectItem>
            <SelectItem value="webhook">Webhook</SelectItem>
            <SelectItem value="database">Database Query</SelectItem>
            <SelectItem value="file">File Operation</SelectItem>
            <SelectItem value="email">Email Service</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="endpoint-url" className="text-sm font-medium text-gray-700">Endpoint URL</Label>
        <Input
          id="endpoint-url"
          type="url"
          className="mt-1"
          placeholder="https://api.example.com/endpoint"
        />
      </div>

      <div>
        <Label htmlFor="http-method" className="text-sm font-medium text-gray-700">HTTP Method</Label>
        <Select defaultValue="POST">
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
            <SelectItem value="PATCH">PATCH</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="headers" className="text-sm font-medium text-gray-700">Headers (JSON)</Label>
        <Textarea
          id="headers"
          className="mt-1"
          placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={node.config.retry.enabled}
          onCheckedChange={(enabled) => onUpdateConfig({
            retry: { ...node.config.retry, enabled }
          })}
        />
        <Label className="text-sm font-medium text-gray-700">Enable Authentication</Label>
      </div>
    </div>
  );
};

export default ToolNodeForm;
