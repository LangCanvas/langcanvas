
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { EnhancedNode } from '../../types/nodeTypes';
import { EnhancedEdge } from '../../types/edgeTypes';

interface PriorityInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  conflictingEdges: EnhancedEdge[];
  nodes: EnhancedNode[];
}

const PriorityInput: React.FC<PriorityInputProps> = ({
  value,
  onChange,
  error,
  conflictingEdges,
  nodes
}) => {
  const getConflictMessage = () => {
    if (conflictingEdges.length === 0) return '';
    
    const conflictNames = conflictingEdges.map(edge => {
      const targetNode = nodes.find(n => n.id === edge.target);
      return targetNode ? `'${targetNode.label}'` : 'Unknown';
    });
    
    return `Priority ${value} conflicts with edge${conflictingEdges.length > 1 ? 's' : ''} to ${conflictNames.join(', ')}`;
  };

  const conflictMessage = getConflictMessage();
  const hasConflict = conflictingEdges.length > 0;

  return (
    <div className="space-y-2">
      <Label htmlFor="priority">Priority</Label>
      <Input
        id="priority"
        type="number"
        min="1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="1"
        className={hasConflict ? 'border-red-500' : ''}
      />
      {hasConflict && (
        <div className="flex items-start gap-2 text-xs text-red-600">
          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>{conflictMessage}</span>
        </div>
      )}
      {error && !hasConflict && (
        <p className="text-xs text-red-600">{error}</p>
      )}
      {!hasConflict && !error && (
        <p className="text-xs text-gray-500">
          Positive integer (1, 2, 3...). Lower numbers execute first.
        </p>
      )}
    </div>
  );
};

export default PriorityInput;
