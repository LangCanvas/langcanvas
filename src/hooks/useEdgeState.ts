
import { useState, useCallback } from 'react';
import { EnhancedEdge } from '../types/edgeTypes';

export const useEdgeState = () => {
  const [edges, setEdges] = useState<EnhancedEdge[]>([]);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

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
