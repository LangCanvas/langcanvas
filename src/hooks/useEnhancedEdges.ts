
import { useEdgeState } from './useEdgeState';
import { useEdgeValidation } from './useEdgeValidation';
import { useConditionalEdges } from './useConditionalEdges';
import { useEdgeOperations } from './useEdgeOperations';

export const useEnhancedEdges = () => {
  const { edges, setEdges, selectedEdge, selectedEdgeId, selectEdge } = useEdgeState();
  const { validateConnection } = useEdgeValidation();
  const { 
    generateConditionalEdgeData, 
    getConditionalNodeEdges, 
    getNodeOutgoingEdges,
    validatePriorityConflicts 
  } = useConditionalEdges();
  
  const {
    addEdge,
    updateEdgeProperties,
    updateEdgeCondition,
    reorderConditionalEdges,
    deleteEdge,
    deleteEdgesForNode,
    canCreateEdge
  } = useEdgeOperations({
    edges,
    setEdges,
    selectedEdgeId,
    setSelectedEdgeId: (id: string | null) => selectEdge(id),
    validateConnection,
    generateConditionalEdgeData
  });

  return {
    edges,
    selectedEdge,
    selectedEdgeId,
    addEdge,
    updateEdgeProperties,
    updateEdgeCondition,
    reorderConditionalEdges,
    deleteEdge,
    deleteEdgesForNode,
    selectEdge,
    validateConnection,
    canCreateEdge,
    getNodeOutgoingEdges: (nodeId: string) => getNodeOutgoingEdges(nodeId, edges),
    getConditionalNodeEdges: (nodeId: string) => getConditionalNodeEdges(nodeId, edges),
    validatePriorityConflicts: (nodeId: string, priority: number, currentEdgeId?: string) => 
      validatePriorityConflicts(nodeId, priority, edges, currentEdgeId)
  };
};
