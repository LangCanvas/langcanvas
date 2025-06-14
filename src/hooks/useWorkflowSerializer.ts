import { useCallback } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { EnhancedEdge } from '../types/edgeTypes';
import { WorkflowJSON } from '../types/workflowTypes';
import { exportToJSON } from '../utils/workflowExporter';
import { importFromJSON } from '../utils/workflowImporter';
import { validateWorkflowJSON } from '../utils/workflowValidator';
import { clearWorkflowFromStorage } from '../utils/workflowStorage';
import { sanitizeNodeLabel } from '../utils/security';

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
    // The importFromJSON function is now imported from workflowImporter
    const result = importFromJSON(
      jsonData,
      addNode,
      addEdge,
      updateNodeProperties,
      updateEdgeProperties,
      clearWorkflow
    );

    // After import, we need to update edge properties for condition branches
    // This logic remains in the hook as it depends on the hook's state (nodes, edges)
    // and needs to run after the core import logic.
    if (result.success) {
      // Determine the parsed workflow object, whether jsonData was string or object
      let parsedWorkflow: WorkflowJSON;
      if (typeof jsonData === 'string') {
        try {
          parsedWorkflow = JSON.parse(jsonData);
        } catch (e) {
          // If parsing fails here, result.errors from importFromJSON should already reflect it.
          // This block is for the post-import processing, so jsonData should be valid if result.success is true.
          // However, defensive parsing is good.
          console.error("Error parsing jsonData in hook after successful import:", e);
          return result; // or handle error appropriately
        }
      } else {
        parsedWorkflow = jsonData;
      }
      
      // Update edge properties for condition nodes
      // Small delay to allow React Flow to update internal state if necessary,
      // and ensure nodes/edges from import are fully available in the hook's state.
      setTimeout(() => {
        // It's crucial to use the `nodes` and `edges` state from the hook's closure at the time of execution,
        // or ideally, get the latest state if this logic were part of a useEffect reacting to import.
        // For simplicity here, we rely on the `nodes` and `edges` passed to the hook.
        // If `importFromJSON` mutates them directly and `useWorkflowSerializer` is a top-level hook, this might be okay.
        // A more robust approach might involve `importFromJSON` returning the created nodes/edges
        // or having this logic react to changes in `nodes`/`edges` state after import.
        
        // Re-fetch current nodes and edges from the hook's props/state for accuracy
        // This assumes `nodes` and `edges` in the hook's scope are updated by `importFromJSON` via callbacks
        const currentNodes = nodes; 
        const currentEdges = edges;

        for (const jsonNode of parsedWorkflow.nodes) {
          if (jsonNode.type === 'conditional' && jsonNode.transitions?.conditions) {
            // Find the newly created conditional node by its label (assuming labels are unique post-import)
            const conditionNode = currentNodes.find(node => node.label === sanitizeNodeLabel(jsonNode.label));
            if (!conditionNode) continue;

            for (const condition of jsonNode.transitions.conditions) {
              // Find the newly created target node by its label
              const targetNode = currentNodes.find(node => node.label === sanitizeNodeLabel(condition.next_node));
              if (!targetNode) continue;

              // Find the edge between the newly created condition and target nodes
              const edge = currentEdges.find(e => e.source === conditionNode.id && e.target === targetNode.id);
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
      }, 100); // Small delay
    }

    return result;
  }, [addNode, addEdge, updateNodeProperties, updateEdgeProperties, clearWorkflow, nodes, edges]); // Added nodes, edges to dependency array

  const validateWorkflow = useCallback((jsonData: string | WorkflowJSON): { valid: boolean; errors: string[] } => {
    // validateWorkflowJSON is now imported from workflowValidator
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
