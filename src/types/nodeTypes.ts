export type NodeType = 'start' | 'agent' | 'tool' | 'function' | 'conditional' | 'parallel' | 'end';

export interface InputSchema {
  [key: string]: string;
}

export interface OutputSchema {
  [key: string]: string;
}

export interface FunctionDefinition {
  name: string;
  input_schema: InputSchema;
  output_schema: OutputSchema;
}

export interface RetryConfig {
  enabled: boolean;
  max_attempts: number;
  delay: number;
}

export interface NodeMetadata {
  tags: string[];
  notes: string;
}

export interface NodeConfig {
  timeout: number;
  retry: RetryConfig;
  concurrency: 'parallel' | 'sequential';
  metadata: NodeMetadata;
}

export interface ConditionalExpression {
  expression: string;
  next_node: string;
}

export interface NodeTransitions {
  default: string;
  conditions: ConditionalExpression[];
}

export interface EnhancedNode {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  y: number;
  function: FunctionDefinition;
  config: NodeConfig;
  transitions: NodeTransitions;
}

export interface WorkflowMeta {
  created_by: string;
  version: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowJSON {
  nodes: EnhancedNode[];
  edges: Array<{
    from: string;
    to: string;
    label?: string;
  }>;
  meta: WorkflowMeta;
}
