
export interface EdgeCondition {
  functionName: string;
  expression?: string; // Made optional for Python skeleton generation
  priority: number;
  isDefault?: boolean;
}

export interface LoopCondition {
  terminationExpression?: string;
  maxIterations?: number;
  enableHumanInterrupt?: boolean;
  iterationCounter?: number;
}

export type EvaluationMode = 
  | 'first-match' 
  | 'all-matches' 
  | 'priority-based' 
  | 'conditional-entrypoint' 
  | 'parallel-conditional';

export type LoopType = 
  | 'unconditional'
  | 'conditional' 
  | 'tool-based'
  | 'self-loop'
  | 'human-in-loop';

export interface ConditionalEdgeMetadata {
  condition: EdgeCondition;
  sourceNodeType: 'conditional';
  evaluationMode: EvaluationMode;
}

export interface LoopEdgeMetadata {
  loopType: LoopType;
  loopCondition: LoopCondition;
  isLoopEdge: true;
  sourceNodeType: string;
}

export type ConnectionHandle = 'left' | 'right';

export interface EnhancedEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: ConnectionHandle;
  targetHandle?: ConnectionHandle;
  label?: string;
  value?: string;
  waypoints?: { x: number, y: number }[];
  conditional?: ConditionalEdgeMetadata;
  loop?: LoopEdgeMetadata;
}
