
import { EnhancedNode } from '../types/nodeTypes';
import { EnhancedEdge } from '../types/edgeTypes';

interface UseIndexHandlersProps {
  nodes: EnhancedNode[];
  deleteEdgesForNode: (nodeId: string) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  addEdge: (sourceNode: EnhancedNode, targetNode: EnhancedNode) => { success: boolean; error?: string };
  selectNode: (nodeId: string | null) => void;
  selectEdge: (edgeId: string | null) => void;
  updateNodeProperties: (nodeId: string, updates: Partial<EnhancedNode>) => void;
  updateEdgeProperties: (edgeId: string, updates: Partial<EnhancedEdge>) => void;
}

export const useIndexHandlers = ({
  nodes,
  deleteEdgesForNode,
  deleteNode,
  deleteEdge,
  addEdge,
  selectNode,
  selectEdge,
  updateNodeProperties,
  updateEdgeProperties,
}: UseIndexHandlersProps) => {

  const handleDeleteNode = (nodeId: string) => {
    console.log(`Deleting node: ${nodeId}`);
    deleteEdgesForNode(nodeId);
    deleteNode(nodeId);
  };

  const handleAddEdge = (sourceNode: EnhancedNode, targetNode: EnhancedNode) => {
    console.log(`Adding edge from ${sourceNode.id} to ${targetNode.id}`);
    return addEdge(sourceNode, targetNode);
  };

  const handleSelectNode = (nodeId: string | null) => {
    console.log(`Selecting node: ${nodeId}`);
    selectNode(nodeId);
    selectEdge(null);
  };

  const handleSelectEdge = (edgeId: string | null) => {
    console.log(`Selecting edge: ${edgeId}`);
    selectEdge(edgeId);
    selectNode(null);
  };

  const handleUpdateNodeProperties = (nodeId: string, updates: Partial<EnhancedNode>) => {
    console.log(`Updating node ${nodeId} properties:`, updates);
    updateNodeProperties(nodeId, updates);
  };

  const handleUpdateEdgeProperties = (edgeId: string, updates: Partial<EnhancedEdge>) => {
    console.log(`Updating edge ${edgeId} properties:`, updates);
    updateEdgeProperties(edgeId, updates);
  };

  return {
    handleDeleteNode,
    handleAddEdge,
    handleSelectNode,
    handleSelectEdge,
    handleUpdateNodeProperties,
    handleUpdateEdgeProperties,
  };
};
