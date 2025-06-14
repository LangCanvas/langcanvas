import { useCallback } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { EnhancedEdge } from '../types/edgeTypes';
import { exportToJSON, importFromJSON, validateWorkflowJSON, WorkflowJSON } from '../utils/workflowSerializer';
import { clearWorkflowFromStorage } from '../utils/workflowStorage';

interface UseWorkflowSerializerProps {
  nodes: EnhancedNode[];
  edges: EnhancedEdge[];
  addNode: (type: EnhancedNode['type'], x: number, y: number) => EnhancedNode | null;
  addEdge: (sourceNode: EnhancedNode, targetNode: EnhancedNode) => { success: boolean; error?: string; edge?: EnhancedEdge };
  updateNodeProperties: (nodeId: string, updates: Partial<EnhancedNode>) => void;
  updateEdgeProperties: (edgeId: string, updates: Partial<EnhancedEdge>) => void;
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
    
    // Clear localStorage
    clearWorkflowFromStorage();
    console.log('🗑️ Workflow and storage cleared');
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
          if (jsonNode.type === 'conditional' && jsonNode.transitions?.conditions) {
            const conditionNode = nodes.find(node => node.label === jsonNode.label);
            if (!conditionNode) continue;

            for (const condition of jsonNode.transitions.conditions) {
              const targetNode = nodes.find(node => node.label === condition.next_node);
              if (!targetNode) continue;

              // Find the edge between condition and target
              const edge = edges.find(e => e.source === conditionNode.id && e.target === targetNode.id);
              if (edge) {
                const edgeUpdates: Partial<EnhancedEdge> = {};
                if (condition.expression) edgeUpdates.label = condition.expression;
                
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
