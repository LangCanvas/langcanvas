
import { EnhancedNode, NodeType } from '../types/nodeTypes';
import { EnhancedEdge } from '../types/edgeTypes';
import { WorkflowJSON, WorkflowJSONNode } from '../types/workflowTypes';
import { sanitizeNodeLabel } from './security';

export const importFromJSON = (
  jsonData: string | WorkflowJSON,
  addNode: (type: NodeType, x: number, y: number) => EnhancedNode | null,
  addEdge: (sourceNode: EnhancedNode, targetNode: EnhancedNode) => { success: boolean; error?: string; edge?: EnhancedEdge },
  updateNodeProperties: (nodeId: string, updates: Partial<EnhancedNode>) => void,
  updateEdgeProperties: (edgeId: string, updates: Partial<EnhancedEdge>) => void,
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

      const sanitizedLabel = sanitizeNodeLabel(jsonNode.label);
      if (!sanitizedLabel) {
        errors.push(`Skipping node with invalid label: ${jsonNode.label}`);
        continue;
      }

      if (nodeLabels.has(sanitizedLabel)) {
        errors.push(`Duplicate node label: ${sanitizedLabel} - skipping duplicate`);
        continue;
      }
      
      let nodeType = jsonNode.type;
      if (!['start', 'agent', 'tool', 'function', 'conditional', 'parallel', 'end'].includes(nodeType)) {
        errors.push(`Unknown node type: ${nodeType} for node ${sanitizedLabel} - treating as tool`);
        nodeType = 'tool' as NodeType;
      }

      // Check for multiple agent nodes, only relevant if current node being added is an agent
      if (nodeType === 'agent') {
        const existingAgentNode = Array.from(nodesByLabel.values()).find(n => n.type === 'agent');
        if (existingAgentNode) {
           errors.push(`Multiple agent nodes found (existing: ${existingAgentNode.label}, new: ${sanitizedLabel}) - converting ${sanitizedLabel} to tool node`);
           nodeType = 'tool' as NodeType;
        }
      }

      const createdNode = addNode(nodeType, jsonNode.position.x, jsonNode.position.y);
      if (!createdNode) {
        errors.push(`Failed to create node: ${sanitizedLabel}`);
        continue;
      }

      nodeLabels.add(sanitizedLabel); // Add after successful creation and type validation
      nodesByLabel.set(sanitizedLabel, createdNode);

      const updates: Partial<EnhancedNode> = {
        label: sanitizedLabel
      };

      // Safely assign properties if they exist in jsonNode
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
      if (!jsonEdge.source || !jsonEdge.target) {
        errors.push(`Edge missing source or target label: ${jsonEdge.id}`);
        continue;
      }
      const sanitizedSource = sanitizeNodeLabel(jsonEdge.source);
      const sanitizedTarget = sanitizeNodeLabel(jsonEdge.target);
      
      const sourceNode = nodesByLabel.get(sanitizedSource);
      const targetNode = nodesByLabel.get(sanitizedTarget);

      if (!sourceNode) {
        errors.push(`Edge source node not found for label: ${sanitizedSource} (original: ${jsonEdge.source})`);
        continue;
      }

      if (!targetNode) {
        errors.push(`Edge target node not found for label: ${sanitizedTarget} (original: ${jsonEdge.target})`);
        continue;
      }

      const result = addEdge(sourceNode, targetNode);
      if (!result.success || !result.edge) { // Ensure result.edge exists
        errors.push(`Failed to create edge from ${sanitizedSource} to ${sanitizedTarget}: ${result.error || 'Unknown reason'}`);
        continue;
      }

      const createdEdge = result.edge;
      const updates: Partial<EnhancedEdge> = {};
      if (jsonEdge.label) {
        updates.label = jsonEdge.label;
      }
      if (jsonEdge.conditional) {
        updates.conditional = jsonEdge.conditional;
      }

      if (Object.keys(updates).length > 0) {
        updateEdgeProperties(createdEdge.id, updates);
      }
    }

    return { success: true, errors };

  } catch (error) {
    return {
      success: false,
      errors: [`Failed to import JSON: ${error instanceof Error ? error.message : String(error)}`]
    };
  }
};
