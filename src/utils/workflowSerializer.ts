import { EnhancedNode } from '../types/nodeTypes';
import { Edge } from '../hooks/useEdges';
import { sanitizeNodeLabel } from './security';

export interface WorkflowJSON {
  nodes: Array<{
    id: string;
    label: string;
    type: 'start' | 'agent' | 'tool' | 'function' | 'conditional' | 'parallel' | 'end';
    position: { x: number; y: number };
    function: {
      name: string;
      input_schema: { [key: string]: string };
      output_schema: { [key: string]: string };
    };
    config: {
      timeout: number;
      retry: {
        enabled: boolean;
        max_attempts: number;
        delay: number;
      };
      concurrency: 'parallel' | 'sequential';
      metadata: {
        tags: string[];
        notes: string;
      };
    };
    transitions: {
      default: string;
      conditions: Array<{
        expression: string;
        next_node: string;
      }>;
    };
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

export const exportToJSON = (nodes: EnhancedNode[], edges: Edge[]): WorkflowJSON => {
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
  const jsonNodes = nodes.map(node => {
    const jsonNode: any = {
      id: node.id,
      label: node.label,
      type: node.type,
      position: { x: node.x, y: node.y },
      function: node.function,
      config: node.config,
      transitions: node.transitions
    };

    return jsonNode;
  });

  // Convert edges to JSON format
  const jsonEdges = edges.map(edge => {
    const sourceNode = nodes.find(node => node.id === edge.source);
    const targetNode = nodes.find(node => node.id === edge.target);
    
    return {
      id: edge.id,
      source: sourceNode?.label || edge.source,
      target: targetNode?.label || edge.target,
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
  addNode: (type: EnhancedNode['type'], x: number, y: number) => EnhancedNode | null,
  addEdge: (sourceNode: EnhancedNode, targetNode: EnhancedNode) => { success: boolean; error?: string },
  updateNodeProperties: (nodeId: string, updates: Partial<EnhancedNode>) => void,
  updateEdgeProperties: (edgeId: string, updates: Partial<Edge>) => void,
  clearWorkflow: () => void
): { success: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  try {
    let workflow: WorkflowJSON;
    if (typeof jsonData === 'string') {
      workflow = JSON.parse(jsonData);
    } else {
      workflow = jsonData;
    }

    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      throw new Error('Invalid JSON: missing or invalid nodes array');
    }

    if (!workflow.edges || !Array.isArray(workflow.edges)) {
      throw new Error('Invalid JSON: missing or invalid edges array');
    }

    clearWorkflow();

    const nodesByLabel = new Map<string, EnhancedNode>();
    const nodeLabels = new Set<string>();

    // Create nodes with sanitized labels
    for (const jsonNode of workflow.nodes) {
      if (!jsonNode.label || !jsonNode.type || typeof jsonNode.position?.x !== 'number' || typeof jsonNode.position?.y !== 'number') {
        errors.push(`Skipping invalid node: ${jsonNode.label || 'unnamed'}`);
        continue;
      }

      // Sanitize the label before processing
      const sanitizedLabel = sanitizeNodeLabel(jsonNode.label);
      if (!sanitizedLabel) {
        errors.push(`Skipping node with invalid label: ${jsonNode.label}`);
        continue;
      }

      if (nodeLabels.has(sanitizedLabel)) {
        errors.push(`Duplicate node label: ${sanitizedLabel} - skipping duplicate`);
        continue;
      }

      if (!['start', 'agent', 'tool', 'function', 'conditional', 'parallel', 'end'].includes(jsonNode.type)) {
        errors.push(`Unknown node type: ${jsonNode.type} for node ${sanitizedLabel} - treating as tool`);
        jsonNode.type = 'tool' as any;
      }

      if (jsonNode.type === 'agent' && Array.from(nodeLabels).some(label => {
        const existingNode = workflow.nodes.find(n => sanitizeNodeLabel(n.label) === label);
        return existingNode?.type === 'agent';
      })) {
        errors.push(`Multiple agent nodes found - converting ${sanitizedLabel} to tool node`);
        jsonNode.type = 'tool' as any;
      }

      const createdNode = addNode(jsonNode.type, jsonNode.position.x, jsonNode.position.y);
      if (!createdNode) {
        errors.push(`Failed to create node: ${sanitizedLabel}`);
        continue;
      }

      nodeLabels.add(sanitizedLabel);
      nodesByLabel.set(sanitizedLabel, createdNode);

      const updates: Partial<EnhancedNode> = {
        label: sanitizedLabel // Use sanitized label
      };

      if (jsonNode.function) {
        updates.function = jsonNode.function;
      }

      if (jsonNode.config) {
        updates.config = jsonNode.config;
      }

      if (jsonNode.transitions) {
        updates.transitions = jsonNode.transitions;
      }

      updateNodeProperties(createdNode.id, updates);
    }

    // Create edges with sanitized node references
    for (const jsonEdge of workflow.edges) {
      const sanitizedSource = sanitizeNodeLabel(jsonEdge.source);
      const sanitizedTarget = sanitizeNodeLabel(jsonEdge.target);
      
      const sourceNode = nodesByLabel.get(sanitizedSource);
      const targetNode = nodesByLabel.get(sanitizedTarget);

      if (!sourceNode) {
        errors.push(`Edge source node not found: ${sanitizedSource}`);
        continue;
      }

      if (!targetNode) {
        errors.push(`Edge target node not found: ${sanitizedTarget}`);
        continue;
      }

      const result = addEdge(sourceNode, targetNode);
      if (!result.success) {
        errors.push(`Failed to create edge from ${sanitizedSource} to ${sanitizedTarget}: ${result.error}`);
        continue;
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
    const nodeLabels = new Set<string>();
    let hasStart = false;

    for (const node of workflow.nodes || []) {
      if (!node.label) {
        errors.push('Node missing label field');
        continue;
      }

      if (nodeLabels.has(node.label)) {
        errors.push(`Duplicate node label: ${node.label}`);
        continue;
      }
      nodeLabels.add(node.label);

      if (!['start', 'agent', 'tool', 'function', 'conditional', 'parallel', 'end'].includes(node.type)) {
        errors.push(`Invalid node type: ${node.type} for node ${node.label}`);
      }

      if (node.type === 'start') {
        if (hasStart) {
          errors.push('Multiple start nodes found');
        }
        hasStart = true;
      }

      if (typeof node.position?.x !== 'number' || typeof node.position?.y !== 'number') {
        errors.push(`Invalid position for node: ${node.label}`);
      }
    }

    // Validate edges
    for (const edge of workflow.edges || []) {
      if (!edge.source || !edge.target) {
        errors.push('Edge missing source or target');
        continue;
      }

      if (!nodeLabels.has(edge.source)) {
        errors.push(`Edge references unknown source node: ${edge.source}`);
      }

      if (!nodeLabels.has(edge.target)) {
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
