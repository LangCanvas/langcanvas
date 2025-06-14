
import { WorkflowJSON, WorkflowJSONNode } from '../types/workflowTypes';
import { NodeType } from '../types/nodeTypes';

const VALID_NODE_TYPES: NodeType[] = ['start', 'agent', 'tool', 'function', 'conditional', 'parallel', 'end'];

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

    // Validate nodes (if nodes array exists)
    const nodeLabels = new Set<string>();
    let hasStart = false;
    let agentCount = 0;

    if (workflow.nodes && Array.isArray(workflow.nodes)) {
      for (const node of workflow.nodes) {
        if (!node.label) {
          errors.push(`Node missing label field (id: ${node.id || 'unknown'})`);
          continue; 
        }

        if (nodeLabels.has(node.label)) {
          errors.push(`Duplicate node label: ${node.label}`);
          // Do not add to nodeLabels again, but continue validating other aspects of this node
        } else {
          nodeLabels.add(node.label);
        }

        if (!node.type || !VALID_NODE_TYPES.includes(node.type)) {
          errors.push(`Invalid or missing node type: ${node.type || 'undefined'} for node ${node.label}`);
        }

        if (node.type === 'start') {
          if (hasStart) {
            errors.push('Multiple start nodes found');
          }
          hasStart = true;
        }
        
        if (node.type === 'agent') {
          agentCount++;
          if (agentCount > 1) {
            // This rule is often handled/transformed during import, but good to validate
            errors.push(`Multiple agent nodes found in JSON (e.g., ${node.label}). Only one agent node is typically supported.`);
          }
        }


        if (typeof node.position?.x !== 'number' || typeof node.position?.y !== 'number') {
          errors.push(`Invalid or missing position for node: ${node.label}`);
        }
      }
       if (!hasStart && workflow.nodes.length > 0) { // Check for start node only if there are nodes
        errors.push('No start node found in workflow.');
      }
    }


    // Validate edges (if edges array exists and nodes were processed)
    if (workflow.edges && Array.isArray(workflow.edges) && nodeLabels.size > 0) {
      for (const edge of workflow.edges) {
        if (!edge.source || !edge.target) {
          errors.push(`Edge (id: ${edge.id || 'unknown'}) missing source or target label`);
          continue;
        }

        if (!nodeLabels.has(edge.source)) {
          errors.push(`Edge (id: ${edge.id || 'unknown'}) references unknown source node label: ${edge.source}`);
        }

        if (!nodeLabels.has(edge.target)) {
          errors.push(`Edge (id: ${edge.id || 'unknown'}) references unknown target node label: ${edge.target}`);
        }
      }
    } else if (workflow.edges && Array.isArray(workflow.edges) && (!workflow.nodes || workflow.nodes.length === 0)) {
        errors.push('Edges defined but no nodes found to validate against.');
    }


    return { valid: errors.length === 0, errors };

  } catch (error) {
    return {
      valid: false,
      errors: [`Invalid JSON format: ${error instanceof Error ? error.message : String(error)}`]
    };
  }
};
