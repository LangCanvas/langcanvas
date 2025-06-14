
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Settings, Clock, RotateCcw, Zap } from 'lucide-react';
import { EnhancedNode } from '../../types/nodeTypes';
import EnhancedFormField from './EnhancedFormField';
import CollapsibleFormSection from './CollapsibleFormSection';

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
        <h4 className="text-md font-medium text-gray-700 flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          Advanced Configuration
        </h4>
        <Button size="sm" variant="ghost" onClick={onToggleAdvanced}>
          {showAdvanced ? 'Hide' : 'Show'}
        </Button>
      </div>

      {showAdvanced && (
        <div className="space-y-4">
          <CollapsibleFormSection 
            title="Execution Settings" 
            description="Configure timeout and execution behavior"
          >
            <EnhancedFormField
              label="Timeout"
              value={selectedNode.config.timeout.toString()}
              onChange={(value) => onUpdateConfig({ timeout: parseInt(value) || 30 })}
              type="number"
              placeholder="30"
              description="Maximum execution time in seconds"
              warning={selectedNode.config.timeout > 300 ? "Long timeouts may affect performance" : undefined}
              success={selectedNode.config.timeout > 0 && selectedNode.config.timeout <= 300}
            />

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                Concurrency Mode
              </label>
              <Select 
                value={selectedNode.config.concurrency} 
                onValueChange={(value: 'parallel' | 'sequential') => onUpdateConfig({ concurrency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sequential">Sequential</SelectItem>
                  <SelectItem value="parallel">Parallel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CollapsibleFormSection>

          <CollapsibleFormSection 
            title="Retry Configuration" 
            description="Configure automatic retry behavior"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <RotateCcw className="w-4 h-4 text-gray-600" />
                  <label className="text-sm font-medium text-gray-700">Enable Retry</label>
                </div>
                <Switch
                  checked={selectedNode.config.retry.enabled}
                  onCheckedChange={(enabled) => onUpdateConfig({
                    retry: { ...selectedNode.config.retry, enabled }
                  })}
                />
              </div>

              {selectedNode.config.retry.enabled && (
                <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                  <EnhancedFormField
                    label="Max Attempts"
                    value={selectedNode.config.retry.max_attempts.toString()}
                    onChange={(value) => onUpdateConfig({
                      retry: { ...selectedNode.config.retry, max_attempts: parseInt(value) || 3 }
                    })}
                    type="number"
                    placeholder="3"
                    description="Maximum number of retry attempts"
                    warning={selectedNode.config.retry.max_attempts > 5 ? "High retry counts may cause delays" : undefined}
                  />

                  <EnhancedFormField
                    label="Retry Delay"
                    value={selectedNode.config.retry.delay.toString()}
                    onChange={(value) => onUpdateConfig({
                      retry: { ...selectedNode.config.retry, delay: parseInt(value) || 5 }
                    })}
                    type="number"
                    placeholder="5"
                    description="Delay between retry attempts (seconds)"
                  />
                </div>
              )}
            </div>
          </CollapsibleFormSection>

          <CollapsibleFormSection 
            title="Metadata & Notes" 
            description="Additional information and documentation"
          >
            <EnhancedFormField
              label="Notes"
              value={selectedNode.config.metadata.notes}
              onChange={(value) => onUpdateConfig({
                metadata: { ...selectedNode.config.metadata, notes: value }
              })}
              type="textarea"
              placeholder="Add notes about this node..."
              description="Internal documentation for this node"
              rows={4}
            />
          </CollapsibleFormSection>
        </div>
      )}
    </div>
  );
};

export default AdvancedConfigurationForm;
