
export interface EdgeCondition {
  functionName: string;
  expression?: string; // Made optional for Python skeleton generation
  priority: number;
  isDefault?: boolean;
}

export type EvaluationMode = 
  | 'first-match' 
  | 'all-matches' 
  | 'priority-based' 
  | 'conditional-entrypoint' 
  | 'parallel-conditional';

export interface ConditionalEdgeMetadata {
  condition: EdgeCondition;
  sourceNodeType: 'conditional';
  evaluationMode: EvaluationMode;
}

export interface EnhancedEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  value?: string;
  waypoints?: { x: number, y: number }[];
  conditional?: ConditionalEdgeMetadata;
}
