
import { useState, useCallback, useEffect } from 'react';
import { EnhancedEdge } from '../types/edgeTypes';
import { saveWorkflowToStorage, loadWorkflowFromStorage } from '../utils/workflowStorage';

export const useEdgeState = () => {
  const [edges, setEdges] = useState<EnhancedEdge[]>([]);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load edges from localStorage on mount
  useEffect(() => {
    const { edges: storedEdges } = loadWorkflowFromStorage();
    if (storedEdges.length > 0) {
      setEdges(storedEdges);
      console.log('📂 Loaded', storedEdges.length, 'edges from storage');
    }
    setIsLoaded(true);
  }, []);

  // Save edges to localStorage whenever they change (but not on initial load)
  useEffect(() => {
    if (isLoaded) {
      // Get current nodes from storage to save together
      const { nodes } = loadWorkflowFromStorage();
      saveWorkflowToStorage(nodes, edges);
    }
  }, [edges, isLoaded]);

  const selectEdge = useCallback((edgeId: string | null) => {
    setSelectedEdgeId(edgeId);
  }, []);

  const selectedEdge = selectedEdgeId ? edges.find(edge => edge.id === selectedEdgeId) : null;

  return {
    edges,
    setEdges,
    selectedEdge,
    selectedEdgeId,
    selectEdge
  };
};
