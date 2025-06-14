
import { EnhancedNode } from '../types/nodeTypes';
import { EnhancedEdge } from '../types/edgeTypes';
import { NodeGroup } from '../types/groupTypes';

export interface ValidationIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  category: 'structure' | 'configuration' | 'performance' | 'best-practice';
  message: string;
  description?: string;
  nodeId?: string;
  edgeId?: string;
  groupId?: string;
  autoFixable: boolean;
  suggestedFix?: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  errorCount: number;
  warningCount: number;
  infoCount: number;
  suggestions: string[];
}

export const validateWorkflowStructure = (
  nodes: EnhancedNode[],
  edges: EnhancedEdge[],
  groups: NodeGroup[] = []
): ValidationResult => {
  const issues: ValidationIssue[] = [];
  const suggestions: string[] = [];

  // Check for start and end nodes
  const startNodes = nodes.filter(node => node.type === 'start');
  const endNodes = nodes.filter(node => node.type === 'end');

  if (startNodes.length === 0) {
    issues.push({
      id: 'missing-start-node',
      severity: 'error',
      category: 'structure',
      message: 'Workflow must have a start node',
      description: 'Every workflow needs a start node to define the entry point',
      autoFixable: true,
      suggestedFix: 'Add a start node to define the workflow entry point'
    });
  }

  if (startNodes.length > 1) {
    issues.push({
      id: 'multiple-start-nodes',
      severity: 'error',
      category: 'structure',
      message: 'Workflow can only have one start node',
      description: 'Multiple start nodes create ambiguity in workflow execution',
      autoFixable: true,
      suggestedFix: 'Remove extra start nodes, keeping only one'
    });
  }

  if (endNodes.length === 0) {
    issues.push({
      id: 'missing-end-node',
      severity: 'warning',
      category: 'structure',
      message: 'Workflow should have at least one end node',
      description: 'End nodes help define clear workflow termination points',
      autoFixable: true,
      suggestedFix: 'Add an end node to mark workflow completion'
    });
  }

  // Check for orphaned nodes (no connections)
  const connectedNodeIds = new Set<string>();
  edges.forEach(edge => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });

  const orphanedNodes = nodes.filter(node => 
    !connectedNodeIds.has(node.id) && node.type !== 'start'
  );

  orphanedNodes.forEach(node => {
    issues.push({
      id: `orphaned-node-${node.id}`,
      severity: 'warning',
      category: 'structure',
      message: `Node "${node.label}" is not connected to the workflow`,
      description: 'Orphaned nodes will not be executed during workflow runs',
      nodeId: node.id,
      autoFixable: false,
      suggestedFix: 'Connect this node to the workflow or remove it if not needed'
    });
  });

  // Check for unreachable nodes (no path from start)
  if (startNodes.length === 1) {
    const reachableNodes = findReachableNodes(startNodes[0], edges);
    const unreachableNodes = nodes.filter(node => 
      !reachableNodes.has(node.id) && node.type !== 'start'
    );

    unreachableNodes.forEach(node => {
      issues.push({
        id: `unreachable-node-${node.id}`,
        severity: 'error',
        category: 'structure',
        message: `Node "${node.label}" is unreachable from the start node`,
        description: 'This node cannot be reached during workflow execution',
        nodeId: node.id,
        autoFixable: false,
        suggestedFix: 'Create a path from the start node to this node'
      });
    });
  }

  // Check for infinite loops
  const cycles = detectCycles(nodes, edges);
  if (cycles.length > 0) {
    cycles.forEach(cycle => {
      issues.push({
        id: `cycle-${cycle.join('-')}`,
        severity: 'warning',
        category: 'structure',
        message: 'Potential infinite loop detected',
        description: `Cycle found: ${cycle.map(nodeId => 
          nodes.find(n => n.id === nodeId)?.label || nodeId
        ).join(' → ')}`,
        autoFixable: false,
        suggestedFix: 'Add exit conditions or break the cycle to prevent infinite loops'
      });
    });
  }

  // Check node configurations
  nodes.forEach(node => {
    validateNodeConfiguration(node, issues);
  });

  // Check edge configurations
  edges.forEach(edge => {
    validateEdgeConfiguration(edge, nodes, issues);
  });

  // Performance suggestions
  if (nodes.length > 50) {
    suggestions.push('Consider breaking large workflows into smaller subworkflows for better maintainability');
  }

  if (edges.length > 100) {
    suggestions.push('Large number of connections detected. Consider using node groups to organize the workflow');
  }

  // Best practice suggestions
  const functionNodes = nodes.filter(node => node.type === 'function');
  if (functionNodes.length > 20) {
    suggestions.push('Consider using templates or reusable components for similar function nodes');
  }

  const result: ValidationResult = {
    valid: issues.filter(issue => issue.severity === 'error').length === 0,
    issues,
    errorCount: issues.filter(issue => issue.severity === 'error').length,
    warningCount: issues.filter(issue => issue.severity === 'warning').length,
    infoCount: issues.filter(issue => issue.severity === 'info').length,
    suggestions
  };

  return result;
};

const findReachableNodes = (startNode: EnhancedNode, edges: EnhancedEdge[]): Set<string> => {
  const reachable = new Set<string>();
  const queue = [startNode.id];
  
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (reachable.has(currentId)) continue;
    
    reachable.add(currentId);
    
    const outgoingEdges = edges.filter(edge => edge.source === currentId);
    outgoingEdges.forEach(edge => {
      if (!reachable.has(edge.target)) {
        queue.push(edge.target);
      }
    });
  }
  
  return reachable;
};

const detectCycles = (nodes: EnhancedNode[], edges: EnhancedEdge[]): string[][] => {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const cycles: string[][] = [];
  
  const dfs = (nodeId: string, path: string[]): void => {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);
    
    const outgoingEdges = edges.filter(edge => edge.source === nodeId);
    
    for (const edge of outgoingEdges) {
      const targetId = edge.target;
      
      if (recursionStack.has(targetId)) {
        // Found cycle
        const cycleStart = path.indexOf(targetId);
        const cycle = path.slice(cycleStart);
        cycles.push([...cycle, targetId]);
      } else if (!visited.has(targetId)) {
        dfs(targetId, [...path]);
      }
    }
    
    recursionStack.delete(nodeId);
  };
  
  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      dfs(node.id, []);
    }
  });
  
  return cycles;
};

const validateNodeConfiguration = (node: EnhancedNode, issues: ValidationIssue[]): void => {
  // Check for empty labels
  if (!node.label || node.label.trim() === '') {
    issues.push({
      id: `empty-label-${node.id}`,
      severity: 'warning',
      category: 'configuration',
      message: `Node has empty label`,
      description: 'Nodes should have descriptive labels for better workflow readability',
      nodeId: node.id,
      autoFixable: true,
      suggestedFix: 'Add a descriptive label to this node'
    });
  }

  // Check function nodes for missing schemas
  if (node.type === 'function') {
    if (!node.function.input_schema || Object.keys(node.function.input_schema).length === 0) {
      issues.push({
        id: `missing-input-schema-${node.id}`,
        severity: 'info',
        category: 'configuration',
        message: `Function node "${node.label}" has no input schema`,
        description: 'Input schemas help with validation and documentation',
        nodeId: node.id,
        autoFixable: false,
        suggestedFix: 'Define an input schema for this function'
      });
    }

    if (!node.function.output_schema || Object.keys(node.function.output_schema).length === 0) {
      issues.push({
        id: `missing-output-schema-${node.id}`,
        severity: 'info',
        category: 'configuration',
        message: `Function node "${node.label}" has no output schema`,
        description: 'Output schemas help with validation and downstream node configuration',
        nodeId: node.id,
        autoFixable: false,
        suggestedFix: 'Define an output schema for this function'
      });
    }
  }

  // Check conditional nodes for conditions
  if (node.type === 'conditional') {
    if (!node.transitions.conditions || node.transitions.conditions.length === 0) {
      issues.push({
        id: `no-conditions-${node.id}`,
        severity: 'warning',
        category: 'configuration',
        message: `Conditional node "${node.label}" has no conditions defined`,
        description: 'Conditional nodes need conditions to determine branching logic',
        nodeId: node.id,
        autoFixable: false,
        suggestedFix: 'Add conditions to define the branching logic'
      });
    }
  }
};

const validateEdgeConfiguration = (
  edge: EnhancedEdge,
  nodes: EnhancedNode[],
  issues: ValidationIssue[]
): void => {
  const sourceNode = nodes.find(node => node.id === edge.source);
  const targetNode = nodes.find(node => node.id === edge.target);

  if (!sourceNode || !targetNode) {
    issues.push({
      id: `invalid-edge-${edge.id}`,
      severity: 'error',
      category: 'structure',
      message: 'Edge connects to non-existent node',
      description: 'Edge references nodes that do not exist in the workflow',
      edgeId: edge.id,
      autoFixable: true,
      suggestedFix: 'Remove this invalid edge'
    });
    return;
  }

  // Check for self-loops
  if (edge.source === edge.target) {
    issues.push({
      id: `self-loop-${edge.id}`,
      severity: 'warning',
      category: 'structure',
      message: `Node "${sourceNode.label}" connects to itself`,
      description: 'Self-loops can cause infinite execution cycles',
      nodeId: sourceNode.id,
      edgeId: edge.id,
      autoFixable: false,
      suggestedFix: 'Consider if this self-loop is intentional and add appropriate exit conditions'
    });
  }

  // Check conditional edges
  if (edge.conditional && sourceNode.type === 'conditional') {
    if (!edge.conditional.condition.expression || edge.conditional.condition.expression.trim() === '') {
      issues.push({
        id: `empty-condition-${edge.id}`,
        severity: 'warning',
        category: 'configuration',
        message: 'Conditional edge has empty condition',
        description: 'Conditional edges should have meaningful condition expressions',
        edgeId: edge.id,
        autoFixable: false,
        suggestedFix: 'Add a condition expression to this edge'
      });
    }
  }
};
