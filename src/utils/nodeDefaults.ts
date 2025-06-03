import { EnhancedNode, NodeType } from '../types/nodeTypes';

export const createDefaultNode = (
  id: string,
  type: NodeType,
  x: number,
  y: number,
  label?: string
): EnhancedNode => {
  const defaultLabel = label || getDefaultLabel(type);
  
  return {
    id,
    type,
    label: defaultLabel,
    x,
    y,
    function: {
      name: getDefaultFunctionName(type),
      input_schema: {},
      output_schema: {}
    },
    config: {
      timeout: 30,
      retry: {
        enabled: true,
        max_attempts: 3,
        delay: 5
      },
      concurrency: 'sequential',
      metadata: {
        tags: [],
        notes: ''
      }
    },
    transitions: {
      default: '',
      conditions: []
    }
  };
};

const getDefaultLabel = (type: NodeType): string => {
  const labelMap: Record<NodeType, string> = {
    agent: 'Start', // Changed from 'Agent' to 'Start' to be clearer
    tool: 'Tool',
    function: 'Function',
    conditional: 'Conditional',
    parallel: 'Parallel',
    end: 'End'
  };
  return labelMap[type];
};

const getDefaultFunctionName = (type: NodeType): string => {
  const functionMap: Record<NodeType, string> = {
    agent: 'start_function', // Changed to reflect start node purpose
    tool: 'tool_function',
    function: 'custom_function',
    conditional: 'conditional_function',
    parallel: 'parallel_function',
    end: 'end_function'
  };
  return functionMap[type];
};

export const validateNodeConfiguration = (node: EnhancedNode): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!node.label.trim()) {
    errors.push('Node label cannot be empty');
  }
  
  if (!node.function.name.trim()) {
    errors.push('Function name is required');
  }
  
  if (node.config.timeout <= 0) {
    errors.push('Timeout must be greater than 0');
  }
  
  if (node.config.retry.enabled && node.config.retry.max_attempts <= 0) {
    errors.push('Max retry attempts must be greater than 0');
  }
  
  if (node.config.retry.enabled && node.config.retry.delay < 0) {
    errors.push('Retry delay cannot be negative');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};
