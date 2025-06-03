
import { Node } from '../hooks/useNodes';
import { Edge } from '../hooks/useEdges';

export interface WorkflowJSON {
  nodes: Array<{
    id: string;
    name: string;
    type: 'start' | 'tool' | 'condition' | 'end';
    position: { x: number; y: number };
    description?: string;
    conditionVariable?: string;
    branches?: Array<{
      label: string;
      value?: string;
      target: string;
    }>;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    label?: string;
    value?: string;
  }>;
  entryPoint?: string;
  version: string;
}

export const exportToJSON = (nodes: Node[], edges: Edge[]): WorkflowJSON => {
  // Find the entry point (target of start node's outgoing edge)
  const startNode = nodes.find(node => node.type === 'start');
  let entryPoint: string | undefined;
  
  if (startNode) {
    const startEdge = edges.find(edge => edge.source === startNode.id);
    if (startEdge) {
      const targetNode = nodes.find(node => node.id === startEdge.target);
      entryPoint = targetNode?.name;
    }
  }

  // Convert nodes to JSON format
  const jsonNodes = nodes.map(node => {
    const jsonNode: any = {
      id: node.id,
      name: node.name,
      type: node.type,
      position: { x: node.x, y: node.y },
      description: node.description || undefined
    };

    // Add condition-specific fields
    if (node.type === 'condition') {
      jsonNode.conditionVariable = node.conditionVariable || '';
      
      // Build branches array from outgoing edges
      const outgoingEdges = edges.filter(edge => edge.source === node.id);
      jsonNode.branches = outgoingEdges.map(edge => {
        const targetNode = nodes.find(n => n.id === edge.target);
        return {
          label: edge.label || '',
          value: edge.value || undefined,
          target: targetNode?.name || edge.target
        };
      });
    }

    return jsonNode;
  });

  // Convert edges to JSON format
  const jsonEdges = edges.map(edge => {
    const sourceNode = nodes.find(node => node.id === edge.source);
    const targetNode = nodes.find(node => node.id === edge.target);
    
    return {
      id: edge.id,
      source: sourceNode?.name || edge.source,
      target: targetNode?.name || edge.target,
      label: edge.label || undefined,
      value: edge.value || undefined
    };
  });

  return {
    nodes: jsonNodes,
    edges: jsonEdges,
    entryPoint,
    version: '1.0'
  };
};

export const importFromJSON = (
  jsonData: string | WorkflowJSON,
  addNode: (type: Node['type'], x: number, y: number) => Node | null,
  addEdge: (sourceNode: Node, targetNode: Node) => { success: boolean; error?: string },
  updateNodeProperties: (nodeId: string, updates: Partial<Node>) => void,
  updateEdgeProperties: (edgeId: string, updates: Partial<Edge>) => void,
  clearWorkflow: () => void
): { success: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  try {
    // Parse JSON if it's a string
    let workflow: WorkflowJSON;
    if (typeof jsonData === 'string') {
      workflow = JSON.parse(jsonData);
    } else {
      workflow = jsonData;
    }

    // Validate basic structure
    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      throw new Error('Invalid JSON: missing or invalid nodes array');
    }

    if (!workflow.edges || !Array.isArray(workflow.edges)) {
      throw new Error('Invalid JSON: missing or invalid edges array');
    }

    // Clear current workflow
    clearWorkflow();

    // Track created nodes by name for edge creation
    const nodesByName = new Map<string, Node>();
    const nodeNames = new Set<string>();

    // Create nodes
    for (const jsonNode of workflow.nodes) {
      // Validate required fields
      if (!jsonNode.name || !jsonNode.type || typeof jsonNode.position?.x !== 'number' || typeof jsonNode.position?.y !== 'number') {
        errors.push(`Skipping invalid node: ${jsonNode.name || 'unnamed'}`);
        continue;
      }

      // Check for duplicate names
      if (nodeNames.has(jsonNode.name)) {
        errors.push(`Duplicate node name: ${jsonNode.name} - skipping duplicate`);
        continue;
      }

      // Validate node type
      if (!['start', 'tool', 'condition', 'end'].includes(jsonNode.type)) {
        errors.push(`Unknown node type: ${jsonNode.type} for node ${jsonNode.name} - treating as tool`);
        jsonNode.type = 'tool' as any;
      }

      // Check for multiple start nodes
      if (jsonNode.type === 'start' && Array.from(nodeNames).some(name => {
        const existingNode = workflow.nodes.find(n => n.name === name);
        return existingNode?.type === 'start';
      })) {
        errors.push(`Multiple start nodes found - converting ${jsonNode.name} to tool node`);
        jsonNode.type = 'tool' as any;
      }

      // Create the node
      const createdNode = addNode(jsonNode.type, jsonNode.position.x, jsonNode.position.y);
      if (!createdNode) {
        errors.push(`Failed to create node: ${jsonNode.name}`);
        continue;
      }

      nodeNames.add(jsonNode.name);
      nodesByName.set(jsonNode.name, createdNode);

      // Update node properties
      const updates: Partial<Node> = {
        name: jsonNode.name
      };

      if (jsonNode.description) {
        updates.description = jsonNode.description;
      }

      if (jsonNode.type === 'condition' && jsonNode.conditionVariable !== undefined) {
        updates.conditionVariable = jsonNode.conditionVariable;
      }

      updateNodeProperties(createdNode.id, updates);
    }

    // Create edges
    for (const jsonEdge of workflow.edges) {
      const sourceNode = nodesByName.get(jsonEdge.source);
      const targetNode = nodesByName.get(jsonEdge.target);

      if (!sourceNode) {
        errors.push(`Edge source node not found: ${jsonEdge.source}`);
        continue;
      }

      if (!targetNode) {
        errors.push(`Edge target node not found: ${jsonEdge.target}`);
        continue;
      }

      const result = addEdge(sourceNode, targetNode);
      if (!result.success) {
        errors.push(`Failed to create edge from ${jsonEdge.source} to ${jsonEdge.target}: ${result.error}`);
        continue;
      }

      // Update edge properties if it has label or value
      if (jsonEdge.label || jsonEdge.value) {
        // Find the edge we just created
        // We need to get the current edges and find the one we just added
        // This is a bit tricky since we don't have direct access to the edges list here
        // We'll need to modify this approach in the actual implementation
      }
    }

    // Update edge properties for condition branches
    // This needs to be done after all edges are created
    for (const jsonNode of workflow.nodes) {
      if (jsonNode.type === 'condition' && jsonNode.branches) {
        const conditionNode = nodesByName.get(jsonNode.name);
        if (!conditionNode) continue;

        for (const branch of jsonNode.branches) {
          const targetNode = nodesByName.get(branch.target);
          if (!targetNode) continue;

          // We need a way to find the specific edge and update it
          // This will need to be handled in the implementation with access to the edges
        }
      }
    }

    return { success: true, errors };

  } catch (error) {
    return {
      success: false,
      errors: [`Failed to import JSON: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
};

export const validateWorkflowJSON = (jsonData: string | WorkflowJSON): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  try {
    let workflow: WorkflowJSON;
    if (typeof jsonData === 'string') {
      workflow = JSON.parse(jsonData);
    } else {
      workflow = jsonData;
    }

    // Check required top-level fields
    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      errors.push('Missing or invalid nodes array');
    }

    if (!workflow.edges || !Array.isArray(workflow.edges)) {
      errors.push('Missing or invalid edges array');
    }

    // Validate nodes
    const nodeNames = new Set<string>();
    let hasStart = false;

    for (const node of workflow.nodes || []) {
      if (!node.name) {
        errors.push('Node missing name field');
        continue;
      }

      if (nodeNames.has(node.name)) {
        errors.push(`Duplicate node name: ${node.name}`);
        continue;
      }
      nodeNames.add(node.name);

      if (!['start', 'tool', 'condition', 'end'].includes(node.type)) {
        errors.push(`Invalid node type: ${node.type} for node ${node.name}`);
      }

      if (node.type === 'start') {
        if (hasStart) {
          errors.push('Multiple start nodes found');
        }
        hasStart = true;
      }

      if (typeof node.position?.x !== 'number' || typeof node.position?.y !== 'number') {
        errors.push(`Invalid position for node: ${node.name}`);
      }
    }

    // Validate edges
    for (const edge of workflow.edges || []) {
      if (!edge.source || !edge.target) {
        errors.push('Edge missing source or target');
        continue;
      }

      if (!nodeNames.has(edge.source)) {
        errors.push(`Edge references unknown source node: ${edge.source}`);
      }

      if (!nodeNames.has(edge.target)) {
        errors.push(`Edge references unknown target node: ${edge.target}`);
      }
    }

    return { valid: errors.length === 0, errors };

  } catch (error) {
    return {
      valid: false,
      errors: [`Invalid JSON format: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
};
