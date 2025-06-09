
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Code, ArrowUp, ArrowDown } from 'lucide-react';
import { EnhancedEdge, EdgeCondition } from '../../types/edgeTypes';
import { EnhancedNode } from '../../types/nodeTypes';

interface ConditionalEdgePropertiesFormProps {
  selectedEdge: EnhancedEdge;
  nodes: EnhancedNode[];
  allConditionalEdges: EnhancedEdge[];
  onUpdateEdge: (edgeId: string, updates: Partial<EnhancedEdge>) => void;
  onUpdateEdgeCondition: (edgeId: string, condition: Partial<EdgeCondition>) => void;
  onDeleteEdge: (edgeId: string) => void;
  onReorderEdges?: (nodeId: string, edgeIds: string[]) => void;
}

const ConditionalEdgePropertiesForm: React.FC<ConditionalEdgePropertiesFormProps> = ({
  selectedEdge,
  nodes,
  allConditionalEdges,
  onUpdateEdge,
  onUpdateEdgeCondition,
  onDeleteEdge,
  onReorderEdges
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const sourceNode = nodes.find(n => n.id === selectedEdge.source);
  const targetNode = nodes.find(n => n.id === selectedEdge.target);
  const condition = selectedEdge.conditional?.condition;

  const handleFunctionNameChange = (value: string) => {
    if (condition) {
      onUpdateEdgeCondition(selectedEdge.id, { functionName: value });
    }
  };

  const handleExpressionChange = (value: string) => {
    if (condition) {
      onUpdateEdgeCondition(selectedEdge.id, { expression: value });
    }
  };

  const handleDefaultToggle = (isDefault: boolean) => {
    if (condition) {
      onUpdateEdgeCondition(selectedEdge.id, { isDefault });
    }
  };

  const handlePriorityChange = (direction: 'up' | 'down') => {
    if (!onReorderEdges || !sourceNode) return;
    
    const sourceEdges = allConditionalEdges
      .filter(edge => edge.source === sourceNode.id && edge.conditional)
      .sort((a, b) => a.conditional!.condition.priority - b.conditional!.condition.priority);
    
    const currentIndex = sourceEdges.findIndex(edge => edge.id === selectedEdge.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex >= 0 && newIndex < sourceEdges.length) {
      const reorderedIds = [...sourceEdges];
      [reorderedIds[currentIndex], reorderedIds[newIndex]] = [reorderedIds[newIndex], reorderedIds[currentIndex]];
      onReorderEdges(sourceNode.id, reorderedIds.map(edge => edge.id));
    }
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

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Condition Properties</h3>
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            Priority {condition.priority}
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

        {/* Function Name */}
        <div className="space-y-2">
          <Label htmlFor="function-name">Function Name</Label>
          <Input
            id="function-name"
            value={condition.functionName}
            onChange={(e) => handleFunctionNameChange(e.target.value)}
            placeholder="e.g., check_user_role"
          />
          <p className="text-xs text-gray-500">
            Unique name for this condition function
          </p>
        </div>

        {/* Priority Controls */}
        <div className="space-y-2">
          <Label>Execution Priority</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePriorityChange('up')}
              disabled={condition.priority === 1}
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium px-3 py-1 bg-gray-100 rounded">
              {condition.priority}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePriorityChange('down')}
            >
              <ArrowDown className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Lower numbers execute first (first-match mode)
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

        {/* Expression Editor */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="expression">Condition Expression</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Code className="w-4 h-4" />
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
          <Textarea
            id="expression"
            value={condition.expression}
            onChange={(e) => handleExpressionChange(e.target.value)}
            placeholder="// Define your condition logic here&#10;return true; // Replace with actual condition"
            rows={isExpanded ? 8 : 4}
            className="font-mono text-sm"
          />
          <p className="text-xs text-gray-500">
            JavaScript function body that returns boolean
          </p>
        </div>

        {/* Evaluation Mode Info */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-sm">
            <div className="font-medium text-blue-900">Evaluation Mode</div>
            <div className="text-blue-700 mt-1">
              {selectedEdge.conditional.evaluationMode === 'first-match' 
                ? 'First Match Wins - stops at first true condition'
                : 'All Matches - evaluates all conditions'
              }
            </div>
          </div>
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
