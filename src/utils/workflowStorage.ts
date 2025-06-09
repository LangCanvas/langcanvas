
import { EnhancedNode } from '../types/nodeTypes';
import { EnhancedEdge } from '../types/edgeTypes';

const WORKFLOW_STORAGE_KEY = 'langcanvas_workflow';
const WORKFLOW_VERSION = '1.0';

export interface StoredWorkflow {
  nodes: EnhancedNode[];
  edges: EnhancedEdge[];
  version: string;
  timestamp: number;
}

export const saveWorkflowToStorage = (nodes: EnhancedNode[], edges: EnhancedEdge[]): void => {
  try {
    const workflowData: StoredWorkflow = {
      nodes,
      edges,
      version: WORKFLOW_VERSION,
      timestamp: Date.now()
    };
    
    localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(workflowData));
    console.log('💾 Workflow saved to localStorage');
  } catch (error) {
    console.warn('Failed to save workflow to localStorage:', error);
  }
};

export const loadWorkflowFromStorage = (): { nodes: EnhancedNode[]; edges: EnhancedEdge[] } => {
  try {
    const stored = localStorage.getItem(WORKFLOW_STORAGE_KEY);
    if (!stored) {
      return { nodes: [], edges: [] };
    }

    const workflowData: StoredWorkflow = JSON.parse(stored);
    
    // Version check for future migrations
    if (workflowData.version !== WORKFLOW_VERSION) {
      console.warn('Workflow version mismatch, clearing storage');
      clearWorkflowFromStorage();
      return { nodes: [], edges: [] };
    }

    console.log('📂 Workflow loaded from localStorage');
    return {
      nodes: workflowData.nodes || [],
      edges: workflowData.edges || []
    };
  } catch (error) {
    console.warn('Failed to load workflow from localStorage:', error);
    return { nodes: [], edges: [] };
  }
};

export const clearWorkflowFromStorage = (): void => {
  try {
    localStorage.removeItem(WORKFLOW_STORAGE_KEY);
    console.log('🗑️ Workflow cleared from localStorage');
  } catch (error) {
    console.warn('Failed to clear workflow from localStorage:', error);
  }
};
