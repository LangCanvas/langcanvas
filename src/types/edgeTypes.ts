
export interface EdgeCondition {
  functionName: string;
  expression: string;
  priority: number;
  isDefault?: boolean;
}

export interface ConditionalEdgeMetadata {
  condition: EdgeCondition;
  sourceNodeType: 'conditional';
  evaluationMode: 'first-match' | 'all-matches';
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
