
import { useCallback } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { EnhancedEdge, EdgeCondition, EvaluationMode } from '../types/edgeTypes';

export const useConditionalEdges = () => {
  const getNextAvailablePriority = useCallback((sourceNodeId: string, existingEdges: EnhancedEdge[]): number => {
    const outgoingEdges = existingEdges.filter(edge => edge.source === sourceNodeId && edge.conditional);
    const usedPriorities = outgoingEdges.map(edge => edge.conditional!.condition.priority);
    
    let priority = 1;
    while (usedPriorities.includes(priority)) {
      priority++;
    }
    return priority;
  }, []);

  const generateConditionalEdgeData = useCallback((sourceNode: EnhancedNode, existingEdges: EnhancedEdge[]): EdgeCondition | null => {
    if (sourceNode.type !== 'conditional') return null;

    const nextPriority = getNextAvailablePriority(sourceNode.id, existingEdges);
    
    return {
      functionName: `condition_${nextPriority}`,
      priority: nextPriority,
      isDefault: false
    };
  }, [getNextAvailablePriority]);

  const getConditionalNodeEdges = useCallback((nodeId: string, edges: EnhancedEdge[]) => {
    return edges.filter(edge => edge.source === nodeId && edge.conditional);
  }, []);

  const getNodeOutgoingEdges = useCallback((nodeId: string, edges: EnhancedEdge[]) => {
    return edges.filter(edge => edge.source === nodeId)
      .sort((a, b) => {
        if (a.conditional && b.conditional) {
          return a.conditional.condition.priority - b.conditional.condition.priority;
        }
        return 0;
      });
  }, []);

  const validatePriorityConflicts = useCallback((nodeId: string, priority: number, edges: EnhancedEdge[], currentEdgeId?: string) => {
    const conflictingEdges = edges.filter(edge => 
      edge.source === nodeId && 
      edge.conditional && 
      edge.conditional.condition.priority === priority &&
      edge.id !== currentEdgeId
    );

    return {
      hasConflict: conflictingEdges.length > 0,
      conflictingEdges
    };
  }, []);

  return {
    getNextAvailablePriority,
    generateConditionalEdgeData,
    getConditionalNodeEdges,
    getNodeOutgoingEdges,
    validatePriorityConflicts
  };
};
