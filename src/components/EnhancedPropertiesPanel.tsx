import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, Settings } from 'lucide-react';
import { EnhancedNode, NodeType } from '../types/nodeTypes';
import { validateNodeConfiguration } from '../utils/nodeDefaults';

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

  const addInputParam = () => {
    const newSchema = { ...selectedNode.function.input_schema, [`param${Object.keys(selectedNode.function.input_schema).length + 1}`]: 'string' };
    updateFunction({ input_schema: newSchema });
  };

  const removeInputParam = (key: string) => {
    const newSchema = { ...selectedNode.function.input_schema };
    delete newSchema[key];
    updateFunction({ input_schema: newSchema });
  };

  const updateInputParam = (oldKey: string, newKey: string, type: string) => {
    const newSchema = { ...selectedNode.function.input_schema };
    delete newSchema[oldKey];
    newSchema[newKey] = type;
    updateFunction({ input_schema: newSchema });
  };

  return (
    <div className="p-4 space-y-6 max-h-full overflow-y-auto">
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-red-800 mb-2">Configuration Errors:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Basic Properties */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Basic Properties</h3>
        
        <div>
          <Label htmlFor="label" className="text-sm font-medium text-gray-700">Label</Label>
          <Input
            id="label"
            value={selectedNode.label}
            onChange={(e) => updateNode({ label: e.target.value })}
            className="mt-1"
            placeholder="Enter node label"
          />
        </div>

        <div>
          <Label htmlFor="type" className="text-sm font-medium text-gray-700">Node Type</Label>
          <Select value={selectedNode.type} onValueChange={(value: NodeType) => updateNode({ type: value })}>
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
            onChange={(e) => updateFunction({ name: e.target.value })}
            className="mt-1"
            placeholder="Enter function name"
          />
        </div>
      </div>

      {/* Input Schema */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-medium text-gray-700">Input Schema</h4>
          <Button size="sm" variant="outline" onClick={addInputParam}>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
        
        <div className="space-y-3">
          {Object.entries(selectedNode.function.input_schema).map(([key, type]) => (
            <div key={key} className="flex items-center space-x-2">
              <Input
                value={key}
                onChange={(e) => updateInputParam(key, e.target.value, type)}
                placeholder="Parameter name"
                className="flex-1"
              />
              <Select value={type} onValueChange={(newType) => updateInputParam(key, key, newType)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="object">Object</SelectItem>
                  <SelectItem value="array">Array</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="ghost" onClick={() => removeInputParam(key)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Configuration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-medium text-gray-700">Advanced Configuration</h4>
          <Button size="sm" variant="ghost" onClick={() => setShowAdvanced(!showAdvanced)}>
            <Settings className="w-4 h-4 mr-1" />
            {showAdvanced ? 'Hide' : 'Show'}
          </Button>
        </div>

        {showAdvanced && (
          <div className="space-y-4 pl-4 border-l-2 border-gray-200">
            <div>
              <Label htmlFor="timeout" className="text-sm font-medium text-gray-700">Timeout (seconds)</Label>
              <Input
                id="timeout"
                type="number"
                value={selectedNode.config.timeout}
                onChange={(e) => updateConfig({ timeout: parseInt(e.target.value) || 30 })}
                className="mt-1"
                min="1"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={selectedNode.config.retry.enabled}
                  onCheckedChange={(enabled) => updateConfig({
                    retry: { ...selectedNode.config.retry, enabled }
                  })}
                />
                <Label className="text-sm font-medium text-gray-700">Enable Retry</Label>
              </div>

              {selectedNode.config.retry.enabled && (
                <div className="space-y-2 pl-6">
                  <div>
                    <Label htmlFor="max-attempts" className="text-sm text-gray-600">Max Attempts</Label>
                    <Input
                      id="max-attempts"
                      type="number"
                      value={selectedNode.config.retry.max_attempts}
                      onChange={(e) => updateConfig({
                        retry: { ...selectedNode.config.retry, max_attempts: parseInt(e.target.value) || 3 }
                      })}
                      className="mt-1"
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="retry-delay" className="text-sm text-gray-600">Delay (seconds)</Label>
                    <Input
                      id="retry-delay"
                      type="number"
                      value={selectedNode.config.retry.delay}
                      onChange={(e) => updateConfig({
                        retry: { ...selectedNode.config.retry, delay: parseInt(e.target.value) || 5 }
                      })}
                      className="mt-1"
                      min="0"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="concurrency" className="text-sm font-medium text-gray-700">Concurrency</Label>
              <Select 
                value={selectedNode.config.concurrency} 
                onValueChange={(value: 'parallel' | 'sequential') => updateConfig({ concurrency: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sequential">Sequential</SelectItem>
                  <SelectItem value="parallel">Parallel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Notes</Label>
              <Textarea
                id="notes"
                value={selectedNode.config.metadata.notes}
                onChange={(e) => updateConfig({
                  metadata: { ...selectedNode.config.metadata, notes: e.target.value }
                })}
                className="mt-1"
                placeholder="Add notes about this node..."
                rows={3}
              />
            </div>
          </div>
        )}
      </div>

      {/* Delete Node */}
      <div className="pt-4 border-t border-gray-200">
        <Button
          variant="destructive"
          onClick={() => onDeleteNode(selectedNode.id)}
          className="w-full"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Node
        </Button>
      </div>
    </div>
  );
};

export default EnhancedPropertiesPanel;
