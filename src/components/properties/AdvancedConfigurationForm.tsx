
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';
import { EnhancedNode } from '../../types/nodeTypes';

interface AdvancedConfigurationFormProps {
  selectedNode: EnhancedNode;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
  onUpdateConfig: (updates: Partial<EnhancedNode['config']>) => void;
}

const AdvancedConfigurationForm: React.FC<AdvancedConfigurationFormProps> = ({
  selectedNode,
  showAdvanced,
  onToggleAdvanced,
  onUpdateConfig
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-medium text-gray-700">Advanced Configuration</h4>
        <Button size="sm" variant="ghost" onClick={onToggleAdvanced}>
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
              onChange={(e) => onUpdateConfig({ timeout: parseInt(e.target.value) || 30 })}
              className="mt-1"
              min="1"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                checked={selectedNode.config.retry.enabled}
                onCheckedChange={(enabled) => onUpdateConfig({
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
                    onChange={(e) => onUpdateConfig({
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
                    onChange={(e) => onUpdateConfig({
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
              onValueChange={(value: 'parallel' | 'sequential') => onUpdateConfig({ concurrency: value })}
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
              onChange={(e) => onUpdateConfig({
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
  );
};

export default AdvancedConfigurationForm;
