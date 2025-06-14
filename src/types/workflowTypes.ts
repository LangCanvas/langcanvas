
import { NodeType, FunctionDefinition, NodeConfig, NodeTransitions } from './nodeTypes';
import { ConditionalEdgeMetadata, EnhancedEdge } from './edgeTypes'; // EnhancedEdge for import function signature

// Defines the structure of a node within the serialized JSON file
export interface WorkflowJSONNode {
  id: string;
  label: string;
  type: NodeType;
  position: { x: number; y: number };
  function: FunctionDefinition;
  config: NodeConfig;
  transitions: NodeTransitions;
}

// Defines the structure of an edge within the serialized JSON file
export interface WorkflowJSONEdge {
  id: string;
  source: string; // Node label
  target: string; // Node label
  label?: string;
  conditional?: ConditionalEdgeMetadata; // Store the whole conditional object
}

// Defines the overall structure of the serialized workflow JSON
export interface WorkflowJSON {
  nodes: WorkflowJSONNode[];
  edges: WorkflowJSONEdge[];
  entryPoint?: string;
  version: string;
}
