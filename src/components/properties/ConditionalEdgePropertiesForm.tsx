
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, RotateCcw, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { EnhancedEdge, EdgeCondition, EvaluationMode } from '../../types/edgeTypes';
import { EnhancedNode } from '../../types/nodeTypes';
import { validatePythonFunctionName } from '../../utils/pythonValidation';

interface ConditionalEdgePropertiesFormProps {
  selectedEdge: EnhancedEdge;
  nodes: EnhancedNode[];
  allConditionalEdges: EnhancedEdge[];
  onUpdateEdge: (edgeId: string, updates: Partial<EnhancedEdge>) => void;
  onUpdateEdgeCondition: (edgeId: string, condition: Partial<EdgeCondition>) => void;
  onDeleteEdge: (edgeId: string) => void;
  onReorderEdges?: (nodeId: string, edgeIds: string[]) => void;
  onUpdateNode?: (nodeId: string, updates: Partial<EnhancedNode>) => void;
}

const EVALUATION_MODE_OPTIONS: { value: EvaluationMode; label: string; description: string }[] = [
  {
    value: 'first-match',
    label: 'First Match',
    description: 'Execute the first condition that evaluates to true (by priority order)'
  },
  {
    value: 'all-matches',
    label: 'All Matches',
    description: 'Execute all conditions that evaluate to true'
  },
  {
    value: 'priority-based',
    label: 'Priority Based',
    description: 'Execute conditions in strict priority order until one succeeds'
  },
  {
    value: 'conditional-entrypoint',
    label: 'Conditional Entrypoint',
    description: 'Use as entry point for conditional routing'
  },
  {
    value: 'parallel-conditional',
    label: 'Parallel Conditional',
    description: 'Evaluate conditions in parallel for performance'
  }
];

const ConditionalEdgePropertiesForm: React.FC<ConditionalEdgePropertiesFormProps> = ({
  selectedEdge,
  nodes,
  allConditionalEdges,
  onUpdateEdge,
  onUpdateEdgeCondition,
  onDeleteEdge,
  onReorderEdges,
  onUpdateNode
}) => {
  const [priorityInput, setPriorityInput] = useState('');
  const [functionNameInput, setFunctionNameInput] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ priority?: string; functionName?: string }>({});
  
  const sourceNode = nodes.find(n => n.id === selectedEdge.source);
  const targetNode = nodes.find(n => n.id === selectedEdge.target);
  const condition = selectedEdge.conditional?.condition;

  // Initialize inputs
  useEffect(() => {
    if (condition) {
      setPriorityInput(condition.priority.toString());
      setFunctionNameInput(condition.functionName);
    }
  }, [condition]);

  // Validate priority input
  const validatePriority = (value: string): string | undefined => {
    if (!value.trim()) return 'Priority is required';
    
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue <= 0) {
      return 'Priority must be a positive number';
    }

    // Check for conflicts with other edges from the same node
    const conflictingEdge = allConditionalEdges.find(edge => 
      edge.source === selectedEdge.source && 
      edge.id !== selectedEdge.id && 
      edge.conditional?.condition.priority === numValue
    );

    if (conflictingEdge) {
      return `Priority ${numValue} is already used by another condition`;
    }

    return undefined;
  };

  const handlePriorityChange = (value: string) => {
    setPriorityInput(value);
    const error = validatePriority(value);
    setValidationErrors(prev => ({ ...prev, priority: error }));

    if (!error && condition) {
      const numValue = parseInt(value);
      onUpdateEdgeCondition(selectedEdge.id, { priority: numValue });
    }
  };

  const handleFunctionNameChange = (value: string) => {
    setFunctionNameInput(value);
    const validation = validatePythonFunctionName(value);
    const error = validation.isValid ? undefined : validation.error;
    setValidationErrors(prev => ({ ...prev, functionName: error }));

    if (!error && condition) {
      onUpdateEdgeCondition(selectedEdge.id, { functionName: value });
    }
  };

  const handleDefaultToggle = (isDefault: boolean) => {
    if (condition) {
      onUpdateEdgeCondition(selectedEdge.id, { isDefault });
    }
  };

  const handleEvaluationModeChange = (mode: EvaluationMode) => {
    if (sourceNode && onUpdateNode) {
      onUpdateNode(sourceNode.id, {
        config: {
          ...sourceNode.config,
          conditional: {
            evaluationMode: mode
          }
        }
      });
    }
  };

  const handleResetPriorities = () => {
    if (!sourceNode || !onReorderEdges) return;

    const sourceEdges = allConditionalEdges
      .filter(edge => edge.source === sourceNode.id && edge.conditional)
      .sort((a, b) => {
        const nodeA = nodes.find(n => n.id === a.target);
        const nodeB = nodes.find(n => n.id === b.target);
        if (!nodeA || !nodeB) return 0;
        
        // Sort by Y position first (top to bottom), then X position (left to right)
        if (Math.abs(nodeA.y - nodeB.y) > 20) {
          return nodeA.y - nodeB.y;
        }
        return nodeA.x - nodeB.x;
      });

    // Update priorities sequentially
    sourceEdges.forEach((edge, index) => {
      onUpdateEdgeCondition(edge.id, { priority: index + 1 });
    });

    toast({
      title: "Priorities Reset",
      description: `Priorities have been reset based on visual position (${sourceEdges.length} conditions updated)`,
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this condition?')) {
      onDeleteEdge(selectedEdge.id);
    }
  };

  if (!selectedEdge.conditional || !condition) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Regular Edge Properties</h3>
        <p className="text-sm text-gray-600">This is not a conditional edge.</p>
      </div>
    );
  }

  const currentEvaluationMode = sourceNode?.config.conditional?.evaluationMode || 'first-match';
  const hasPriorityConflicts = Object.values(validationErrors).some(error => error);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Condition Properties</h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              Priority {condition.priority}
            </Badge>
            {hasPriorityConflicts && (
              <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">
                <AlertCircle className="w-3 h-3 mr-1" />
                Error
              </Badge>
            )}
          </div>
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

        {/* Function Name */}
        <div className="space-y-2">
          <Label htmlFor="function-name">Function Name</Label>
          <Input
            id="function-name"
            value={functionNameInput}
            onChange={(e) => handleFunctionNameChange(e.target.value)}
            placeholder="e.g., check_user_role"
            className={validationErrors.functionName ? 'border-red-500' : ''}
          />
          {validationErrors.functionName && (
            <p className="text-xs text-red-600">{validationErrors.functionName}</p>
          )}
          <p className="text-xs text-gray-500">
            Python function name (snake_case). Skeleton will be generated automatically.
          </p>
        </div>

        {/* Priority Input */}
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Input
            id="priority"
            type="number"
            min="1"
            value={priorityInput}
            onChange={(e) => handlePriorityChange(e.target.value)}
            placeholder="1"
            className={validationErrors.priority ? 'border-red-500' : ''}
          />
          {validationErrors.priority && (
            <p className="text-xs text-red-600">{validationErrors.priority}</p>
          )}
          <p className="text-xs text-gray-500">
            Positive integer (1, 2, 3...). Lower numbers execute first.
          </p>
        </div>

        {/* Reset Priorities Button */}
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetPriorities}
            disabled={!onReorderEdges}
            className="w-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset All Priorities (Top-to-Bottom, Left-to-Right)
          </Button>
        </div>

        {/* Evaluation Mode */}
        <div className="space-y-2">
          <Label>Evaluation Mode (Node-level)</Label>
          <Select value={currentEvaluationMode} onValueChange={handleEvaluationModeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EVALUATION_MODE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            Applies to all conditions from this node
          </p>
        </div>

        {/* Default Condition Toggle */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is-default"
              checked={condition.isDefault || false}
              onChange={(e) => handleDefaultToggle(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="is-default">Default condition (fallback)</Label>
          </div>
          <p className="text-xs text-gray-500">
            This condition will execute if no others match
          </p>
        </div>
      </div>

      {/* Delete Button */}
      <div className="pt-4 border-t border-gray-200">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          className="w-full"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Condition
        </Button>
      </div>
    </div>
  );
};

export default ConditionalEdgePropertiesForm;
