
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { NodeLoopConfig } from '../../../types/loopTypes';

interface AgentLoopSettingsProps {
  config: NodeLoopConfig;
  onUpdateConfig: (updates: Partial<NodeLoopConfig>) => void;
}

const AgentLoopSettings: React.FC<AgentLoopSettingsProps> = ({
  config,
  onUpdateConfig
}) => {
  const updateAgentSettings = (updates: Partial<typeof config.agentSettings>) => {
    onUpdateConfig({
      agentSettings: { ...config.agentSettings, ...updates }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Agent Loop Type</CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            value={config.loopType} 
            onValueChange={(value) => onUpdateConfig({ loopType: value as any })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select agent loop type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="agent-tool-loop">Agent-tool loop (classic LLM pattern)</SelectItem>
              <SelectItem value="agent-reasoning-loop">Agent reasoning loop (self-reflection)</SelectItem>
              <SelectItem value="human-in-loop">Human-in-the-loop (approval workflows)</SelectItem>
              <SelectItem value="multi-agent-loop">Multi-agent loop (agent collaboration)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agent-Specific Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Context Window Management</Label>
            <Select 
              value={config.agentSettings?.contextWindowManagement || 'sliding'}
              onValueChange={(value: any) => updateAgentSettings({ contextWindowManagement: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sliding">Sliding Window</SelectItem>
                <SelectItem value="summarization">Summarization</SelectItem>
                <SelectItem value="truncation">Truncation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Memory Retention Strategy</Label>
            <Select 
              value={config.agentSettings?.memoryRetention || 'selective'}
              onValueChange={(value: any) => updateAgentSettings({ memoryRetention: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Memory</SelectItem>
                <SelectItem value="selective">Selective Memory</SelectItem>
                <SelectItem value="summary">Summary Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Decision Confidence Threshold</Label>
            <Input 
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={config.agentSettings?.decisionConfidenceThreshold || 0.8}
              onChange={(e) => updateAgentSettings({ decisionConfidenceThreshold: parseFloat(e.target.value) })}
            />
          </div>

          <div>
            <Label>Human Intervention Triggers</Label>
            <Textarea 
              value={config.agentSettings?.humanInterventionTriggers?.join('\n') || ''}
              onChange={(e) => updateAgentSettings({ 
                humanInterventionTriggers: e.target.value.split('\n').filter(Boolean) 
              })}
              placeholder="Low confidence score&#10;Error threshold exceeded&#10;Unclear user intent"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>LLM-Specific Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch 
              checked={config.agentSettings?.temperatureAdjustment || false}
              onCheckedChange={(checked) => updateAgentSettings({ temperatureAdjustment: checked })}
            />
            <Label>Adjust temperature per iteration</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              checked={config.agentSettings?.tokenLimitManagement || false}
              onCheckedChange={(checked) => updateAgentSettings({ tokenLimitManagement: checked })}
            />
            <Label>Token limit management</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              checked={config.agentSettings?.qualityChecking || false}
              onCheckedChange={(checked) => updateAgentSettings({ qualityChecking: checked })}
            />
            <Label>Response quality checking</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              checked={config.agentSettings?.hallucinationDetection || false}
              onCheckedChange={(checked) => updateAgentSettings({ hallucinationDetection: checked })}
            />
            <Label>Hallucination detection</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentLoopSettings;
