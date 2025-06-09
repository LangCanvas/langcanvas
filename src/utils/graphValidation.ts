import { EnhancedNode } from '../types/nodeTypes';
import { EnhancedEdge } from '../types/edgeTypes';

export interface ValidationIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  severity: 'error' | 'warning';
  message: string;
  nodeIds?: string[];
  edgeIds?: string[];
  category: 'structure' | 'configuration' | 'data' | 'conditional';
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  errorCount: number;
  warningCount: number;
}

export const validateGraph = (nodes: EnhancedNode[], edges: EnhancedEdge[]): ValidationResult => {
  const issues: ValidationIssue[] = [];
  let issueCounter = 0;

  // Helper function to create issue ID
  const createIssueId = () => `issue-${++issueCounter}`;

  // 1. Check for Start nodes
  const startNodes = nodes.filter(node => node.type === 'start');
  if (startNodes.length === 0) {
    issues.push({
      id: createIssueId(),
      severity: 'error',
      message: 'No Start node present. Please add a Start node to designate an entry point.',
      type: 'error',
      category: 'structure'
    });
  } else if (startNodes.length > 1) {
    issues.push({
      id: createIssueId(),
      severity: 'error',
      message: 'Multiple Start nodes present. Only one entry point is allowed.',
      nodeIds: startNodes.map(n => n.id),
      type: 'error',
      category: 'structure'
    });
  }

  // 2. Check for duplicate labels (using label instead of name)
  const labelMap = new Map<string, string[]>();
  nodes.forEach(node => {
    const label = node.label?.toLowerCase() || '';
    if (!labelMap.has(label)) {
      labelMap.set(label, []);
    }
    labelMap.get(label)!.push(node.id);
  });

  labelMap.forEach((nodeIds, label) => {
    if (nodeIds.length > 1 && label.trim() !== '') {
      issues.push({
        id: createIssueId(),
        severity: 'error',
        message: `Multiple nodes share the label '${label}'. Labels must be unique.`,
        nodeIds,
        type: 'error',
        category: 'data'
      });
    }
  });

  // 3. Check for cycles using DFS
  const findCycles = (): string[] => {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const cycleNodes = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outgoingEdges = edges.filter(edge => edge.source === nodeId);
      for (const edge of outgoingEdges) {
        if (!visited.has(edge.target)) {
          if (dfs(edge.target)) {
            cycleNodes.add(nodeId);
            return true;
          }
        } else if (recursionStack.has(edge.target)) {
          cycleNodes.add(nodeId);
          cycleNodes.add(edge.target);
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        dfs(node.id);
      }
    });

    return Array.from(cycleNodes);
  };

  const cycleNodes = findCycles();
  if (cycleNodes.length > 0) {
    issues.push({
      id: createIssueId(),
      severity: 'error',
      message: 'Cycle detected in the workflow. Workflows must not have cycles.',
      nodeIds: cycleNodes,
      type: 'error',
      category: 'structure'
    });
  }

  // 4. Check for unreachable nodes (if there's a start node)
  if (startNodes.length === 1) {
    const startNode = startNodes[0];
    const reachableNodes = new Set<string>();
    
    const dfs = (nodeId: string) => {
      if (reachableNodes.has(nodeId)) return;
      reachableNodes.add(nodeId);
      
      const outgoingEdges = edges.filter(edge => edge.source === nodeId);
      outgoingEdges.forEach(edge => dfs(edge.target));
    };

    dfs(startNode.id);

    const unreachableNodes = nodes.filter(node => 
      node.id !== startNode.id && !reachableNodes.has(node.id)
    );

    unreachableNodes.forEach(node => {
      issues.push({
        id: createIssueId(),
        severity: 'warning',
        message: `Node '${node.label}' is unreachable (no path from Start). It will never execute.`,
        nodeIds: [node.id],
        type: 'warning',
        category: 'structure'
      });
    });
  }

  // 5. Check for nodes with no outgoing edges (except End nodes)
  const nodesWithoutOutgoing = nodes.filter(node => {
    if (node.type === 'end') return false;
    return !edges.some(edge => edge.source === node.id);
  });

  nodesWithoutOutgoing.forEach(node => {
    issues.push({
      id: createIssueId(),
      severity: 'warning',
      message: `Node '${node.label}' has no outgoing connection and is not an End node. The workflow may not terminate properly.`,
      nodeIds: [node.id],
      type: 'warning',
      category: 'structure'
    });
  });

  // 6. Check for invalid edge connections
  edges.forEach(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    if (!sourceNode || !targetNode) {
      issues.push({
        id: createIssueId(),
        severity: 'error',
        message: 'Edge references non-existent nodes.',
        edgeIds: [edge.id],
        type: 'error',
        category: 'structure'
      });
      return;
    }

    // Check if Start node has incoming edges
    if (targetNode.type === 'start') {
      issues.push({
        id: createIssueId(),
        severity: 'error',
        message: `Start node '${targetNode.label}' cannot have incoming connections.`,
        edgeIds: [edge.id],
        nodeIds: [targetNode.id],
        type: 'error',
        category: 'structure'
      });
    }

    // Check if End node has outgoing edges
    if (sourceNode.type === 'end') {
      issues.push({
        id: createIssueId(),
        severity: 'error',
        message: `End node '${sourceNode.label}' cannot have outgoing connections.`,
        edgeIds: [edge.id],
        nodeIds: [sourceNode.id],
        type: 'error',
        category: 'structure'
      });
    }
  });

  // 7. Check Tool nodes for multiple outgoing edges
  nodes.filter(node => node.type === 'tool').forEach(toolNode => {
    const outgoingEdges = edges.filter(edge => edge.source === toolNode.id);
    if (outgoingEdges.length > 1) {
      issues.push({
        id: createIssueId(),
        severity: 'error',
        message: `Tool node '${toolNode.label}' has multiple outputs. Use a Condition node to branch.`,
        nodeIds: [toolNode.id],
        edgeIds: outgoingEdges.map(e => e.id),
        type: 'error',
        category: 'structure'
      });
    }
  });

  // 8. Check Conditional nodes
  nodes.filter(node => node.type === 'conditional').forEach(conditionNode => {
    const outgoingEdges = edges.filter(edge => edge.source === conditionNode.id);
    
    // Check for single branch condition
    if (outgoingEdges.length === 1) {
      issues.push({
        id: createIssueId(),
        severity: 'warning',
        message: `Condition node '${conditionNode.label}' has only one branch and will act like a normal step.`,
        nodeIds: [conditionNode.id],
        type: 'warning',
        category: 'conditional'
      });
    }

    // Check for duplicate branch labels
    const labels = outgoingEdges.map(e => e.label?.toLowerCase()).filter(Boolean);
    const uniqueLabels = new Set(labels);
    if (labels.length !== uniqueLabels.size) {
      issues.push({
        id: createIssueId(),
        severity: 'error',
        message: `Condition node '${conditionNode.label}' has duplicate branch labels.`,
        nodeIds: [conditionNode.id],
        edgeIds: outgoingEdges.map(e => e.id),
        type: 'error',
        category: 'conditional'
      });
    }
  });

  // Validate conditional node priorities
  validateConditionalPriorities(nodes, edges, issues);

  const errorCount = issues.filter(issue => issue.severity === 'error').length;
  const warningCount = issues.filter(issue => issue.severity === 'warning').length;

  return {
    isValid: errorCount === 0,
    issues,
    errorCount,
    warningCount
  };
};

const validateConditionalPriorities = (nodes: EnhancedNode[], edges: EnhancedEdge[], issues: ValidationIssue[]) => {
  const conditionalNodes = nodes.filter(node => node.type === 'conditional');

  conditionalNodes.forEach(node => {
    const nodeEdges = edges.filter(edge => edge.source === node.id && edge.conditional);
    
    if (nodeEdges.length === 0) return;

    // Check for priority conflicts
    const priorities = nodeEdges.map(edge => edge.conditional!.condition.priority);
    const duplicatePriorities = priorities.filter((priority, index) => priorities.indexOf(priority) !== index);
    
    if (duplicatePriorities.length > 0) {
      const uniqueDuplicates = [...new Set(duplicatePriorities)];
      const conflictingEdgeIds = nodeEdges
        .filter(edge => uniqueDuplicates.includes(edge.conditional!.condition.priority))
        .map(edge => edge.id);

      issues.push({
        id: `priority-conflict-${node.id}`,
        type: 'error',
        severity: 'error',
        message: `Conditional node "${node.label}" has duplicate priorities: ${uniqueDuplicates.join(', ')}. Each condition must have a unique priority.`,
        nodeIds: [node.id],
        edgeIds: conflictingEdgeIds,
        category: 'conditional'
      });
    }

    // Check for invalid priorities (zero or negative)
    const invalidPriorityEdges = nodeEdges.filter(edge => edge.conditional!.condition.priority <= 0);
    if (invalidPriorityEdges.length > 0) {
      issues.push({
        id: `invalid-priority-${node.id}`,
        type: 'error',
        severity: 'error',
        message: `Conditional node "${node.label}" has invalid priorities. Priorities must be positive numbers (1, 2, 3, ...).`,
        nodeIds: [node.id],
        edgeIds: invalidPriorityEdges.map(edge => edge.id),
        category: 'conditional'
      });
    }
  });
};
