
import { useCallback } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { EnhancedEdge, EdgeCondition, EvaluationMode } from '../types/edgeTypes';

interface UseEdgeOperationsProps {
  edges: EnhancedEdge[];
  setEdges: React.Dispatch<React.SetStateAction<EnhancedEdge[]>>;
  selectedEdgeId: string | null;
  setSelectedEdgeId: React.Dispatch<React.SetStateAction<string | null>>;
  validateConnection: (sourceNode: EnhancedNode, targetNode: EnhancedNode, existingEdges: EnhancedEdge[]) => { valid: boolean; error?: string };
  generateConditionalEdgeData: (sourceNode: EnhancedNode, existingEdges: EnhancedEdge[]) => EdgeCondition | null;
}

export const useEdgeOperations = ({
  edges,
  setEdges,
  selectedEdgeId,
  setSelectedEdgeId,
  validateConnection,
  generateConditionalEdgeData
}: UseEdgeOperationsProps) => {
  
  const addEdge = useCallback((sourceNode: EnhancedNode, targetNode: EnhancedNode) => {
    console.log(`🔗 Attempting to add edge: ${sourceNode.label} -> ${targetNode.label}`);
    
    const validation = validateConnection(sourceNode, targetNode, edges);
    
    if (!validation.valid) {
      console.error(`❌ Edge validation failed: ${validation.error}`);
      return { success: false, error: validation.error };
    }

    const id = `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newEdge: EnhancedEdge = {
      id,
      source: sourceNode.id,
      target: targetNode.id,
      sourceHandle: 'right',
      targetHandle: 'left',
    };

    if (sourceNode.type === 'conditional') {
      const condition = generateConditionalEdgeData(sourceNode, edges);
      if (condition) {
        const evaluationMode: EvaluationMode = sourceNode.config.conditional?.evaluationMode || 'first-match';
        newEdge.conditional = {
          condition,
          sourceNodeType: 'conditional',
          evaluationMode
        };
        newEdge.label = condition.functionName;
      }
    }

    setEdges(prev => [...prev, newEdge]);
    console.log(`✅ Edge added successfully:`, newEdge);
    return { success: true, edge: newEdge };
  }, [edges, validateConnection, generateConditionalEdgeData, setEdges]);

  const updateEdgeProperties = useCallback((edgeId: string, updates: Partial<EnhancedEdge>) => {
    setEdges(prev => prev.map(edge => 
      edge.id === edgeId ? { ...edge, ...updates } : edge
    ));
  }, [setEdges]);

  const updateEdgeCondition = useCallback((edgeId: string, condition: Partial<EdgeCondition>) => {
    setEdges(prev => prev.map(edge => {
      if (edge.id === edgeId && edge.conditional) {
        return {
          ...edge,
          conditional: {
            ...edge.conditional,
            condition: { ...edge.conditional.condition, ...condition }
          },
          label: condition.functionName || edge.label
        };
      }
      return edge;
    }));
  }, [setEdges]);

  const reorderConditionalEdges = useCallback((nodeId: string, edgeIds: string[]) => {
    setEdges(prev => prev.map(edge => {
      if (edge.source === nodeId && edge.conditional) {
        const newPriority = edgeIds.indexOf(edge.id) + 1;
        return {
          ...edge,
          conditional: {
            ...edge.conditional,
            condition: { ...edge.conditional.condition, priority: newPriority }
          }
        };
      }
      return edge;
    }));
  }, [setEdges]);

  const deleteEdge = useCallback((edgeId: string) => {
    setEdges(prev => prev.filter(edge => edge.id !== edgeId));
    if (selectedEdgeId === edgeId) {
      setSelectedEdgeId(null);
    }
  }, [selectedEdgeId, setEdges, setSelectedEdgeId]);

  const deleteEdgesForNode = useCallback((nodeId: string) => {
    setEdges(prev => prev.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedEdgeId && edges.some(edge => edge.id === selectedEdgeId && (edge.source === nodeId || edge.target === nodeId))) {
      setSelectedEdgeId(null);
    }
  }, [selectedEdgeId, edges, setEdges, setSelectedEdgeId]);

  const canCreateEdge = useCallback((sourceNode: EnhancedNode) => {
    return sourceNode.type !== 'end';
  }, []);

  return {
    addEdge,
    updateEdgeProperties,
    updateEdgeCondition,
    reorderConditionalEdges,
    deleteEdge,
    deleteEdgesForNode,
    canCreateEdge
  };
};
