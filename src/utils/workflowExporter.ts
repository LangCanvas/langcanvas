
import { EnhancedNode } from '../types/nodeTypes';
import { EnhancedEdge } from '../types/edgeTypes';
import { WorkflowJSON, WorkflowJSONNode, WorkflowJSONEdge } from '../types/workflowTypes';

export const exportToJSON = (nodes: EnhancedNode[], edges: EnhancedEdge[]): WorkflowJSON => {
  // Find the entry point (target of start node's outgoing edge)
  const startNode = nodes.find(node => node.type === 'start');
  let entryPoint: string | undefined;
  
  if (startNode) {
    const startEdge = edges.find(edge => edge.source === startNode.id);
    if (startEdge) {
      const targetNode = nodes.find(node => node.id === startEdge.target);
      entryPoint = targetNode?.label;
    }
  }

  // Convert nodes to JSON format
  const jsonNodes: WorkflowJSONNode[] = nodes.map(node => {
    // Ensure all properties of WorkflowJSONNode are explicitly mapped
    return {
      id: node.id,
      label: node.label,
      type: node.type,
      position: { x: node.x, y: node.y },
      function: node.function,
      config: node.config,
      transitions: node.transitions
    };
  });

  // Convert edges to JSON format
  const jsonEdges: WorkflowJSONEdge[] = edges.map(edge => {
    const sourceNode = nodes.find(node => node.id === edge.source);
    const targetNode = nodes.find(node => node.id === edge.target);
    
    return {
      id: edge.id,
      source: sourceNode?.label || edge.source, // Fallback to ID if label not found (should ideally not happen)
      target: targetNode?.label || edge.target, // Fallback to ID
      label: edge.label,
      conditional: edge.conditional,
    };
  });

  return {
    nodes: jsonNodes,
    edges: jsonEdges,
    entryPoint,
    version: '1.0'
  };
};
