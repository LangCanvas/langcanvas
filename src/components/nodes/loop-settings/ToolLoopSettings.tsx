
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { NodeLoopConfig } from '../../../types/loopTypes';

interface ToolLoopSettingsProps {
  config: NodeLoopConfig;
  onUpdateConfig: (updates: Partial<NodeLoopConfig>) => void;
}

const ToolLoopSettings: React.FC<ToolLoopSettingsProps> = ({
  config,
  onUpdateConfig
}) => {
  const updateToolSettings = (updates: Partial<typeof config.toolSettings>) => {
    onUpdateConfig({
      toolSettings: { ...config.toolSettings, ...updates }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tool Loop Type</CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            value={config.loopType} 
            onValueChange={(value) => onUpdateConfig({ loopType: value as any })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select tool loop type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="retry-loop">Tool retry loop (error recovery)</SelectItem>
              <SelectItem value="validation-loop">Tool validation loop (result verification)</SelectItem>
              <SelectItem value="multi-tool-loop">Multi-tool loop (tool chains)</SelectItem>
              <SelectItem value="agent-tool-loop">Agent-tool loop (LLM-agent patterns)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tool-Specific Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Retry Strategy</Label>
            <Select 
              value={config.toolSettings?.retryStrategy || 'exponential-backoff'}
              onValueChange={(value: any) => updateToolSettings({ retryStrategy: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exponential-backoff">Exponential Backoff</SelectItem>
                <SelectItem value="fixed-delay">Fixed Delay</SelectItem>
                <SelectItem value="immediate">Immediate Retry</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Tool Timeout (seconds)</Label>
            <Input 
              type="number"
              value={config.toolSettings?.toolTimeout || 30}
              onChange={(e) => updateToolSettings({ toolTimeout: parseInt(e.target.value) })}
            />
          </div>

          <div>
            <Label>Result Validation Criteria (Python)</Label>
            <Textarea 
              value={config.toolSettings?.resultValidation || ''}
              onChange={(e) => updateToolSettings({ resultValidation: e.target.value })}
              placeholder="# Validate tool result&#10;return result.status == 'success'"
              rows={3}
            />
          </div>

          <div>
            <Label>Failure Handling</Label>
            <Select 
              value={config.toolSettings?.failureHandling || 'abort'}
              onValueChange={(value: any) => updateToolSettings({ failureHandling: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="abort">Abort on failure</SelectItem>
                <SelectItem value="fallback">Use fallback tool</SelectItem>
                <SelectItem value="continue">Continue despite failure</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integration Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Input Preprocessing (Python)</Label>
            <Textarea 
              value={config.toolSettings?.preprocessing || ''}
              onChange={(e) => updateToolSettings({ preprocessing: e.target.value })}
              placeholder="# Preprocess input before tool call&#10;return input"
              rows={3}
            />
          </div>

          <div>
            <Label>Output Postprocessing (Python)</Label>
            <Textarea 
              value={config.toolSettings?.postprocessing || ''}
              onChange={(e) => updateToolSettings({ postprocessing: e.target.value })}
              placeholder="# Postprocess output after tool call&#10;return output"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ToolLoopSettings;
