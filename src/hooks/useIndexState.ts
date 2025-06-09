
import { useEnhancedNodes } from './useEnhancedNodes';
import { useEnhancedEdges } from './useEnhancedEdges';
import { useNodeCreation } from './useNodeCreation';
import { useWorkflowSerializer } from './useWorkflowSerializer';
import { useValidation } from './useValidation';

export const useIndexState = () => {
  const nodeState = useEnhancedNodes();
  const edgeState = useEnhancedEdges();
  
  const nodeCreation = useNodeCreation({ 
    onAddNode: nodeState.addNode 
  });

  const workflowSerializer = useWorkflowSerializer({
    nodes: nodeState.nodes,
    edges: edgeState.edges,
    addNode: nodeState.addNode,
    addEdge: edgeState.addEdge,
    updateNodeProperties: nodeState.updateNodeProperties,
    updateEdgeProperties: edgeState.updateEdgeProperties,
    deleteNode: nodeState.deleteNode,
    deleteEdge: edgeState.deleteEdge,
    selectNode: nodeState.selectNode,
    selectEdge: edgeState.selectEdge
  });

  const validation = useValidation({ 
    nodes: nodeState.nodes, 
    edges: edgeState.edges 
  });

  return {
    nodeState,
    edgeState,
    nodeCreation,
    workflowSerializer,
    validation
  };
};
