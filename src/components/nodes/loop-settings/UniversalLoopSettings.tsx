
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { NodeLoopConfig } from '../../../types/loopTypes';

interface UniversalLoopSettingsProps {
  config: NodeLoopConfig;
  onUpdateConfig: (updates: Partial<NodeLoopConfig>) => void;
}

const UniversalLoopSettings: React.FC<UniversalLoopSettingsProps> = ({
  config,
  onUpdateConfig
}) => {
  const updateSafetySettings = (updates: Partial<typeof config.safetySettings>) => {
    onUpdateConfig({
      safetySettings: { ...config.safetySettings, ...updates }
    });
  };

  const updateHumanIntervention = (updates: Partial<typeof config.humanIntervention>) => {
    onUpdateConfig({
      humanIntervention: { ...config.humanIntervention, ...updates }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Safety & Monitoring</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Emergency Stop Conditions</Label>
            <Textarea 
              value={config.safetySettings.emergencyStopConditions?.join('\n') || ''}
              onChange={(e) => updateSafetySettings({ 
                emergencyStopConditions: e.target.value.split('\n').filter(Boolean) 
              })}
              placeholder="Memory usage > 90%&#10;CPU usage > 95%&#10;Error rate > 50%"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              checked={config.safetySettings.performanceMonitoring}
              onCheckedChange={(checked) => updateSafetySettings({ performanceMonitoring: checked })}
            />
            <Label>Enable performance monitoring</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              checked={config.safetySettings.executionLogging}
              onCheckedChange={(checked) => updateSafetySettings({ executionLogging: checked })}
            />
            <Label>Enable execution logging</Label>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Memory Limit (MB)</Label>
              <Input 
                type="number"
                value={config.safetySettings.resourceUsageLimits?.memory || 512}
                onChange={(e) => updateSafetySettings({
                  resourceUsageLimits: {
                    ...config.safetySettings.resourceUsageLimits,
                    memory: parseInt(e.target.value)
                  }
                })}
              />
            </div>
            <div>
              <Label>CPU Limit (%)</Label>
              <Input 
                type="number"
                value={config.safetySettings.resourceUsageLimits?.cpu || 80}
                onChange={(e) => updateSafetySettings({
                  resourceUsageLimits: {
                    ...config.safetySettings.resourceUsageLimits,
                    cpu: parseInt(e.target.value)
                  }
                })}
              />
            </div>
            <div>
              <Label>Time Limit (sec)</Label>
              <Input 
                type="number"
                value={config.safetySettings.resourceUsageLimits?.time || 300}
                onChange={(e) => updateSafetySettings({
                  resourceUsageLimits: {
                    ...config.safetySettings.resourceUsageLimits,
                    time: parseInt(e.target.value)
                  }
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Human Intervention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Manual Approval Points</Label>
            <Textarea 
              value={config.humanIntervention.manualApprovalPoints?.join('\n') || ''}
              onChange={(e) => updateHumanIntervention({ 
                manualApprovalPoints: e.target.value.split('\n').filter(Boolean) 
              })}
              placeholder="Before tool execution&#10;After error threshold&#10;Before expensive operations"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              checked={config.humanIntervention.breakpointInsertion}
              onCheckedChange={(checked) => updateHumanIntervention({ breakpointInsertion: checked })}
            />
            <Label>Enable breakpoint insertion</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              checked={config.humanIntervention.realTimeMonitoring}
              onCheckedChange={(checked) => updateHumanIntervention({ realTimeMonitoring: checked })}
            />
            <Label>Real-time monitoring dashboard</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              checked={config.humanIntervention.emergencyStopButton}
              onCheckedChange={(checked) => updateHumanIntervention({ emergencyStopButton: checked })}
            />
            <Label>Emergency stop button</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UniversalLoopSettings;
