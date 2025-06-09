
import React, { useState, useEffect } from 'react';
import { EnhancedEdge, EdgeCondition, EvaluationMode } from '../../types/edgeTypes';
import { EnhancedNode } from '../../types/nodeTypes';
import { validatePythonFunctionName } from '../../utils/pythonValidation';
import PriorityInput from './PriorityInput';
import FunctionNameInput from './FunctionNameInput';
import EvaluationModeSelector from './EvaluationModeSelector';
import EdgeConnectionInfo from './EdgeConnectionInfo';
import ConditionalEdgeActions from './ConditionalEdgeActions';

interface ConditionalEdgePropertiesFormProps {
  selectedEdge: EnhancedEdge;
  nodes: EnhancedNode[];
  allConditionalEdges: EnhancedEdge[];
  onUpdateEdge: (edgeId: string, updates: Partial<EnhancedEdge>) => void;
  onUpdateEdgeCondition: (edgeId: string, condition: Partial<EdgeCondition>) => void;
  onDeleteEdge: (edgeId: string) => void;
  onReorderEdges?: (nodeId: string, edgeIds: string[]) => void;
  onUpdateNode?: (nodeId: string, updates: Partial<EnhancedNode>) => void;
  validatePriorityConflicts: (nodeId: string, priority: number, currentEdgeId?: string) => { hasConflict: boolean; conflictingEdges: EnhancedEdge[] };
}

const ConditionalEdgePropertiesForm: React.FC<ConditionalEdgePropertiesFormProps> = ({
  selectedEdge,
  nodes,
  allConditionalEdges,
  onUpdateEdge,
  onUpdateEdgeCondition,
  onDeleteEdge,
  onReorderEdges,
  onUpdateNode,
  validatePriorityConflicts
}) => {
  const [priorityInput, setPriorityInput] = useState('');
  const [functionNameInput, setFunctionNameInput] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ priority?: string; functionName?: string }>({});
  const [priorityConflicts, setPriorityConflicts] = useState<EnhancedEdge[]>([]);
  
  const sourceNode = nodes.find(n => n.id === selectedEdge.source);
  const targetNode = nodes.find(n => n.id === selectedEdge.target);
  const condition = selectedEdge.conditional?.condition;

  useEffect(() => {
    if (condition) {
      setPriorityInput(condition.priority.toString());
      setFunctionNameInput(condition.functionName);
    }
  }, [condition]);

  const validatePriority = (value: string): string | undefined => {
    if (!value.trim()) return 'Priority is required';
    
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue <= 0) {
      return 'Priority must be a positive number';
    }

    return undefined;
  };

  const handlePriorityChange = (value: string) => {
    setPriorityInput(value);
    const error = validatePriority(value);
    setValidationErrors(prev => ({ ...prev, priority: error }));

    // Check for conflicts
    if (!error && condition && sourceNode) {
      const numValue = parseInt(value);
      const conflicts = validatePriorityConflicts(sourceNode.id, numValue, selectedEdge.id);
      setPriorityConflicts(conflicts.conflictingEdges);
      
      // Always update the condition with the new priority, regardless of conflicts
      onUpdateEdgeCondition(selectedEdge.id, { priority: numValue });
    } else {
      setPriorityConflicts([]);
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

  const handleDelete = () => {
    onDeleteEdge(selectedEdge.id);
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
  const hasConflicts = priorityConflicts.length > 0;

  return (
    <div className="space-y-6">
      <EdgeConnectionInfo
        sourceNode={sourceNode}
        targetNode={targetNode}
        priority={condition.priority}
        hasConflicts={hasConflicts}
      />

      <FunctionNameInput
        value={functionNameInput}
        onChange={handleFunctionNameChange}
        error={validationErrors.functionName}
      />

      <PriorityInput
        value={priorityInput}
        onChange={handlePriorityChange}
        error={validationErrors.priority}
        conflictingEdges={priorityConflicts}
        nodes={nodes}
      />

      <EvaluationModeSelector
        value={currentEvaluationMode}
        onChange={handleEvaluationModeChange}
      />

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is-default"
            checked={condition.isDefault || false}
            onChange={(e) => handleDefaultToggle(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="is-default" className="text-sm font-medium">Default condition (fallback)</label>
        </div>
        <p className="text-xs text-gray-500">
          This condition will execute if no others match
        </p>
      </div>

      <ConditionalEdgeActions
        sourceNode={sourceNode}
        allConditionalEdges={allConditionalEdges}
        nodes={nodes}
        onResetPriorities={onReorderEdges ? () => {} : undefined}
        onDeleteEdge={handleDelete}
        onUpdateEdgeCondition={onUpdateEdgeCondition}
      />
    </div>
  );
};

export default ConditionalEdgePropertiesForm;
