
// LangCanvas Core Utilities
// This file will contain the main application logic and state management

export interface Position {
  x: number;
  y: number;
}

export interface GraphNode {
  id: string;
  type: 'start' | 'tool' | 'condition' | 'end';
  name: string;
  position: Position;
  data: Record<string, any>;
  connections: string[];
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface LangCanvasState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId: string | null;
  zoom: number;
  pan: Position;
}

// Global application state (will be replaced with proper state management later)
export const appState: LangCanvasState = {
  nodes: [],
  edges: [],
  selectedNodeId: null,
  zoom: 1,
  pan: { x: 0, y: 0 }
};

// Utility functions for future implementation
export const generateNodeId = (): string => {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateEdgeId = (): string => {
  return `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Stub functions for toolbar actions
export const newProject = (): void => {
  console.log('Creating new project...');
  appState.nodes = [];
  appState.edges = [];
  appState.selectedNodeId = null;
  // Future: Clear canvas and reset state
};

export const importJSON = (): void => {
  console.log('Import JSON functionality - to be implemented');
  // Future: Show file picker and parse JSON
};

export const exportJSON = (): void => {
  console.log('Export JSON functionality - to be implemented');
  // Future: Generate and download JSON file
  const data = {
    nodes: appState.nodes,
    edges: appState.edges,
    metadata: {
      version: '1.0',
      created: new Date().toISOString()
    }
  };
  console.log('Would export:', data);
};

export const showCodePreview = (): void => {
  console.log('Code preview functionality - to be implemented');
  // Future: Generate and display code based on current graph
};

// Node creation utility
export const createNode = (type: GraphNode['type'], position: Position, name?: string): GraphNode => {
  return {
    id: generateNodeId(),
    type,
    name: name || type.charAt(0).toUpperCase() + type.slice(1),
    position,
    data: {},
    connections: []
  };
};

// Validation utilities
export const isValidGraph = (nodes: GraphNode[], edges: GraphEdge[]): boolean => {
  // Future: Implement graph validation logic
  const hasStart = nodes.some(node => node.type === 'start');
  const hasEnd = nodes.some(node => node.type === 'end');
  return hasStart && hasEnd;
};

// Canvas interaction utilities
export const getCanvasCoordinates = (element: HTMLElement, clientX: number, clientY: number): Position => {
  const rect = element.getBoundingClientRect();
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
};

// Future: Add more utilities for graph manipulation, serialization, etc.
