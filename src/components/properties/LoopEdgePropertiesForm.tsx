
import React, { useState, useEffect } from 'react';
import { EnhancedEdge, LoopCondition } from '../../types/edgeTypes';
import { EnhancedNode } from '../../types/nodeTypes';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, Trash2, RotateCcw } from 'lucide-react';
import { useLoopManagement } from '../../hooks/useLoopManagement';
import CollapsibleFormSection from './CollapsibleFormSection';

interface LoopEdgePropertiesFormProps {
  selectedEdge: EnhancedEdge;
  nodes: EnhancedNode[];
  onUpdateEdge: (edgeId: string, updates: Partial<EnhancedEdge>) => void;
  onDeleteEdge: (edgeId: string) => void;
}

const LoopEdgePropertiesForm: React.FC<LoopEdgePropertiesFormProps> = ({
  selectedEdge,
  nodes,
  onUpdateEdge,
  onDeleteEdge
}) => {
  const { updateLoopCondition, getLoopSafetyStatus } = useLoopManagement();
  const [terminationExpression, setTerminationExpression] = useState('');
  const [maxIterations, setMaxIterations] = useState('');
  const [enableHumanInterrupt, setEnableHumanInterrupt] = useState(false);

  const sourceNode = nodes.find(n => n.id === selectedEdge.source);
  const targetNode = nodes.find(n => n.id === selectedEdge.target);
  const loopCondition = selectedEdge.loop?.loopCondition;
  const safetyStatus = getLoopSafetyStatus(selectedEdge);

  useEffect(() => {
    if (loopCondition) {
      setTerminationExpression(loopCondition.terminationExpression || '');
      setMaxIterations(loopCondition.maxIterations?.toString() || '');
      setEnableHumanInterrupt(loopCondition.enableHumanInterrupt || false);
    }
  }, [loopCondition]);

  const handleUpdateLoopCondition = (updates: Partial<LoopCondition>) => {
    if (selectedEdge.loop) {
      const updatedEdge = updateLoopCondition(selectedEdge, updates);
      onUpdateEdge(selectedEdge.id, updatedEdge);
    }
  };

  const handleTerminationChange = (value: string) => {
    setTerminationExpression(value);
    handleUpdateLoopCondition({ terminationExpression: value });
  };

  const handleMaxIterationsChange = (value: string) => {
    setMaxIterations(value);
    const numValue = value ? parseInt(value) : undefined;
    handleUpdateLoopCondition({ maxIterations: numValue });
  };

  const handleHumanInterruptToggle = (enabled: boolean) => {
    setEnableHumanInterrupt(enabled);
    handleUpdateLoopCondition({ enableHumanInterrupt: enabled });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this loop?')) {
      onDeleteEdge(selectedEdge.id);
    }
  };

  if (!selectedEdge.loop) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Loop Information */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            Loop Edge Properties
          </h3>
          <Badge variant={selectedEdge.loop.loopType === 'self-loop' ? 'secondary' : 'default'}>
            {selectedEdge.loop.loopType}
          </Badge>
        </div>
        
        {/* Connection Info */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span className="font-medium">From:</span>
              <span className="text-gray-800">{sourceNode?.label || 'Unknown'}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="font-medium">To:</span>
              <span className="text-gray-800">{targetNode?.label || 'Unknown'}</span>
            </div>
          </div>
        </div>

        {/* Safety Status */}
        <div className={`p-3 rounded-lg flex items-center gap-2 ${
          safetyStatus.status === 'safe' ? 'bg-green-50 text-green-800' :
          safetyStatus.status === 'warning' ? 'bg-yellow-50 text-yellow-800' :
          'bg-red-50 text-red-800'
        }`}>
          {safetyStatus.status === 'safe' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">{safetyStatus.message}</span>
        </div>
      </div>

      {/* Loop Configuration */}
      <CollapsibleFormSection 
        title="Loop Configuration" 
        description="Configure loop termination and safety settings"
      >
        <div className="space-y-4">
          {/* Termination Expression */}
          <div className="space-y-2">
            <Label htmlFor="termination-expression">Termination Condition</Label>
            <Textarea
              id="termination-expression"
              value={terminationExpression}
              onChange={(e) => handleTerminationChange(e.target.value)}
              placeholder="Enter Python expression for loop termination (e.g., state.get('should_continue') == False)"
              rows={3}
            />
            <p className="text-xs text-gray-500">
              Python expression that returns True to continue the loop, False to exit
            </p>
          </div>

          {/* Max Iterations */}
          <div className="space-y-2">
            <Label htmlFor="max-iterations">Maximum Iterations</Label>
            <Input
              id="max-iterations"
              type="number"
              value={maxIterations}
              onChange={(e) => handleMaxIterationsChange(e.target.value)}
              placeholder="100"
              min="1"
              max="10000"
            />
            <p className="text-xs text-gray-500">
              Safety limit to prevent infinite loops (leave empty for no limit)
            </p>
          </div>

          {/* Human Interrupt */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="human-interrupt">Human-in-the-Loop</Label>
              <p className="text-xs text-gray-500">
                Allow human intervention during loop execution
              </p>
            </div>
            <Switch
              id="human-interrupt"
              checked={enableHumanInterrupt}
              onCheckedChange={handleHumanInterruptToggle}
            />
          </div>
        </div>
      </CollapsibleFormSection>

      {/* Loop Statistics */}
      <CollapsibleFormSection 
        title="Loop Statistics" 
        description="Runtime information about this loop"
        defaultOpen={false}
      >
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Current Iteration:</span>
            <span className="font-medium">{loopCondition?.iterationCounter || 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Loop Type:</span>
            <span className="font-medium">{selectedEdge.loop.loopType}</span>
          </div>
        </div>
      </CollapsibleFormSection>

      {/* Delete Button */}
      <div className="pt-4 border-t border-gray-200">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          className="w-full"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Loop
        </Button>
      </div>
    </div>
  );
};

export default LoopEdgePropertiesForm;
