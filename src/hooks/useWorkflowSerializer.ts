
import { useCallback } from 'react';
import { Node } from './useNodes';
import { Edge } from './useEdges';
import { exportToJSON, importFromJSON, validateWorkflowJSON, WorkflowJSON } from '../utils/workflowSerializer';

interface UseWorkflowSerializerProps {
  nodes: Node[];
  edges: Edge[];
  addNode: (type: Node['type'], x: number, y: number) => Node | null;
  addEdge: (sourceNode: Node, targetNode: Node) => { success: boolean; error?: string };
  updateNodeProperties: (nodeId: string, updates: Partial<Node>) => void;
  updateEdgeProperties: (edgeId: string, updates: Partial<Edge>) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  selectEdge: (edgeId: string | null) => void;
}

export const useWorkflowSerializer = ({
  nodes,
  edges,
  addNode,
  addEdge,
  updateNodeProperties,
  updateEdgeProperties,
  deleteNode,
  deleteEdge,
  selectNode,
  selectEdge
}: UseWorkflowSerializerProps) => {

  const clearWorkflow = useCallback(() => {
    // Clear selection first
    selectNode(null);
    selectEdge(null);
    
    // Delete all edges first (to avoid orphaned references)
    const edgeIds = edges.map(edge => edge.id);
    edgeIds.forEach(edgeId => deleteEdge(edgeId));
    
    // Delete all nodes
    const nodeIds = nodes.map(node => node.id);
    nodeIds.forEach(nodeId => deleteNode(nodeId));
  }, [nodes, edges, deleteNode, deleteEdge, selectNode, selectEdge]);

  const exportWorkflow = useCallback((): WorkflowJSON => {
    return exportToJSON(nodes, edges);
  }, [nodes, edges]);

  const exportWorkflowAsString = useCallback((): string => {
    const workflow = exportToJSON(nodes, edges);
    return JSON.stringify(workflow, null, 2);
  }, [nodes, edges]);

  const importWorkflow = useCallback((jsonData: string | WorkflowJSON): { success: boolean; errors: string[] } => {
    const result = importFromJSON(
      jsonData,
      addNode,
      addEdge,
      updateNodeProperties,
      updateEdgeProperties,
      clearWorkflow
    );

    // After import, we need to update edge properties for condition branches
    // This is a workaround since we need access to the created edges
    if (result.success && typeof jsonData !== 'string') {
      const workflow = jsonData;
      
      // Update edge properties for condition nodes
      setTimeout(() => {
        for (const jsonNode of workflow.nodes) {
          if (jsonNode.type === 'condition' && jsonNode.branches) {
            const conditionNode = nodes.find(node => node.name === jsonNode.name);
            if (!conditionNode) continue;

            for (const branch of jsonNode.branches) {
              const targetNode = nodes.find(node => node.name === branch.target);
              if (!targetNode) continue;

              // Find the edge between condition and target
              const edge = edges.find(e => e.source === conditionNode.id && e.target === targetNode.id);
              if (edge) {
                const edgeUpdates: Partial<Edge> = {};
                if (branch.label) edgeUpdates.label = branch.label;
                if (branch.value) edgeUpdates.value = branch.value;
                
                if (Object.keys(edgeUpdates).length > 0) {
                  updateEdgeProperties(edge.id, edgeUpdates);
                }
              }
            }
          }
        }
      }, 100); // Small delay to ensure nodes and edges are created
    }

    return result;
  }, [addNode, addEdge, updateNodeProperties, updateEdgeProperties, clearWorkflow, nodes, edges]);

  const validateWorkflow = useCallback((jsonData: string | WorkflowJSON): { valid: boolean; errors: string[] } => {
    return validateWorkflowJSON(jsonData);
  }, []);

  return {
    exportWorkflow,
    exportWorkflowAsString,
    importWorkflow,
    validateWorkflow,
    clearWorkflow
  };
};
