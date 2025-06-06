
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2 } from 'lucide-react';
import { Edge } from '../../hooks/useEdges';
import { EnhancedNode } from '../../types/nodeTypes';

interface EdgePropertiesFormProps {
  selectedEdge: Edge;
  nodes: EnhancedNode[];
  onUpdateEdge: (edgeId: string, updates: Partial<Edge>) => void;
  onDeleteEdge: (edgeId: string) => void;
}

const EdgePropertiesForm: React.FC<EdgePropertiesFormProps> = ({
  selectedEdge,
  nodes,
  onUpdateEdge,
  onDeleteEdge
}) => {
  const sourceNode = nodes.find(n => n.id === selectedEdge.source);
  const targetNode = nodes.find(n => n.id === selectedEdge.target);

  const handleLabelChange = (value: string) => {
    onUpdateEdge(selectedEdge.id, { label: value });
  };

  const handleValueChange = (value: string) => {
    onUpdateEdge(selectedEdge.id, { value: value });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this connection?')) {
      onDeleteEdge(selectedEdge.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Edge Properties</h3>
        
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

        {/* Label Field */}
        <div className="space-y-2">
          <Label htmlFor="edge-label">Label</Label>
          <Input
            id="edge-label"
            value={selectedEdge.label || ''}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="Enter edge label..."
          />
          <p className="text-xs text-gray-500">
            Optional label to describe this connection
          </p>
        </div>

        {/* Value Field */}
        <div className="space-y-2">
          <Label htmlFor="edge-value">Value</Label>
          <Textarea
            id="edge-value"
            value={selectedEdge.value || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder="Enter edge value or condition..."
            rows={3}
          />
          <p className="text-xs text-gray-500">
            Optional value or condition for this connection
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
          Delete Connection
        </Button>
      </div>
    </div>
  );
};

export default EdgePropertiesForm;
