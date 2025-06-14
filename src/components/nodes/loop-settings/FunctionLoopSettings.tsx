
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { NodeLoopConfig, LoopType } from '../../../types/loopTypes';

interface FunctionLoopSettingsProps {
  config: NodeLoopConfig;
  onUpdateConfig: (updates: Partial<NodeLoopConfig>) => void;
}

const FunctionLoopSettings: React.FC<FunctionLoopSettingsProps> = ({
  config,
  onUpdateConfig
}) => {
  const handleLoopTypeChange = (value: LoopType) => {
    onUpdateConfig({ loopType: value });
  };

  const updateBehaviorSettings = (updates: Partial<typeof config.behaviorSettings>) => {
    onUpdateConfig({
      behaviorSettings: { ...config.behaviorSettings, ...updates }
    });
  };

  const addTerminationCondition = () => {
    const newCondition = {
      type: 'max-iterations' as const,
      value: 10,
      description: 'Maximum iterations limit'
    };
    onUpdateConfig({
      terminationConditions: [...config.terminationConditions, newCondition]
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Loop Type Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="loop-type">Function Loop Type</Label>
            <Select value={config.loopType} onValueChange={handleLoopTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select loop type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="self-loop">Self-loop (function calls itself)</SelectItem>
                <SelectItem value="forward-loop">Forward loop (participates in cycle)</SelectItem>
                <SelectItem value="conditional-loop">Conditional loop (based on output)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Termination Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {config.terminationConditions.map((condition, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Condition Type</Label>
                  <Select value={condition.type}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expression">Python Expression</SelectItem>
                      <SelectItem value="max-iterations">Max Iterations</SelectItem>
                      <SelectItem value="timeout">Timeout</SelectItem>
                      <SelectItem value="error-threshold">Error Threshold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Value</Label>
                  <Input 
                    value={condition.value} 
                    placeholder={condition.type === 'expression' ? 'result.success == True' : '10'}
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Input 
                  value={condition.description || ''} 
                  placeholder="Optional description"
                />
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addTerminationCondition}>
            Add Termination Condition
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Loop Behavior</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch 
              checked={config.behaviorSettings?.statePreservation || false}
              onCheckedChange={(checked) => updateBehaviorSettings({ statePreservation: checked })}
            />
            <Label>Preserve state between iterations</Label>
          </div>

          <div>
            <Label>Input Transformation (Python)</Label>
            <Textarea 
              value={config.behaviorSettings?.inputTransformation || ''}
              onChange={(e) => updateBehaviorSettings({ inputTransformation: e.target.value })}
              placeholder="# Transform input for next iteration&#10;return input"
              rows={3}
            />
          </div>

          <div>
            <Label>Output Transformation (Python)</Label>
            <Textarea 
              value={config.behaviorSettings?.outputTransformation || ''}
              onChange={(e) => updateBehaviorSettings({ outputTransformation: e.target.value })}
              placeholder="# Transform output for next iteration&#10;return output"
              rows={3}
            />
          </div>

          <div>
            <Label>Error Handling Strategy</Label>
            <Select 
              value={config.behaviorSettings?.errorHandling || 'stop'}
              onValueChange={(value: 'stop' | 'continue' | 'retry') => 
                updateBehaviorSettings({ errorHandling: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stop">Stop on error</SelectItem>
                <SelectItem value="continue">Continue on error</SelectItem>
                <SelectItem value="retry">Retry on error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FunctionLoopSettings;
