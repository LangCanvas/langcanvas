
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, RotateCcw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { EnhancedNode } from '../../types/nodeTypes';
import { EnhancedEdge } from '../../types/edgeTypes';

interface ConditionalEdgeActionsProps {
  sourceNode?: EnhancedNode;
  allConditionalEdges: EnhancedEdge[];
  nodes: EnhancedNode[];
  onResetPriorities?: () => void;
  onDeleteEdge: () => void;
  onUpdateEdgeCondition: (edgeId: string, condition: any) => void;
}

const ConditionalEdgeActions: React.FC<ConditionalEdgeActionsProps> = ({
  sourceNode,
  allConditionalEdges,
  nodes,
  onResetPriorities,
  onDeleteEdge,
  onUpdateEdgeCondition
}) => {
  const handleResetPriorities = () => {
    if (!sourceNode) return;

    const sourceEdges = allConditionalEdges
      .filter(edge => edge.source === sourceNode.id && edge.conditional)
      .sort((a, b) => {
        const nodeA = nodes.find(n => n.id === a.target);
        const nodeB = nodes.find(n => n.id === b.target);
        if (!nodeA || !nodeB) return 0;
        
        if (Math.abs(nodeA.y - nodeB.y) > 20) {
          return nodeA.y - nodeB.y;
        }
        return nodeA.x - nodeB.x;
      });

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
      onDeleteEdge();
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetPriorities}
          disabled={!onResetPriorities}
          className="w-full"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset All Priorities (Top-to-Bottom, Left-to-Right)
        </Button>
      </div>

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

export default ConditionalEdgeActions;
