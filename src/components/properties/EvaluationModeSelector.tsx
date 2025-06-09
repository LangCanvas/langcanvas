
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EvaluationMode } from '../../types/edgeTypes';

interface EvaluationModeSelectorProps {
  value: EvaluationMode;
  onChange: (mode: EvaluationMode) => void;
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

const EvaluationModeSelector: React.FC<EvaluationModeSelectorProps> = ({
  value,
  onChange
}) => {
  return (
    <div className="space-y-2">
      <Label>Evaluation Mode (Node-level)</Label>
      <Select value={value} onValueChange={onChange}>
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
  );
};

export default EvaluationModeSelector;
