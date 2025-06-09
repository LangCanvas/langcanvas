
import { useState, useCallback } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { EnhancedEdge, EdgeCondition } from '../types/edgeTypes';

export const useEnhancedEdges = () => {
  const [edges, setEdges] = useState<EnhancedEdge[]>([]);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const findPath = useCallback((start: string, target: string, edges: EnhancedEdge[]): boolean => {
    const visited = new Set<string>();
    const stack = [start];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (current === target) return true;
      
      if (visited.has(current)) continue;
      visited.add(current);

      const outgoingEdges = edges.filter(edge => edge.source === current);
      for (const edge of outgoingEdges) {
        stack.push(edge.target);
      }
    }
    return false;
  }, []);

  const validateConnection = useCallback((sourceNode: EnhancedNode, targetNode: EnhancedNode, existingEdges: EnhancedEdge[]): { valid: boolean; error?: string } => {
    console.log(`🔍 Validating connection: ${sourceNode.label} (${sourceNode.type}) -> ${targetNode.label} (${targetNode.type})`);
    
    if (sourceNode.id === targetNode.id) {
      return { valid: false, error: "Cannot connect a node to itself" };
    }

    if (sourceNode.type === 'end') {
      return { valid: false, error: "End node cannot have outgoing connections" };
    }

    const duplicateEdge = existingEdges.find(edge => 
      edge.source === sourceNode.id && edge.target === targetNode.id
    );
    if (duplicateEdge) {
      return { valid: false, error: "This connection already exists" };
    }

    if (findPath(targetNode.id, sourceNode.id, existingEdges)) {
      return { valid: false, error: "This connection would create a cycle, which is not allowed" };
    }

    // Special validation for conditional nodes
    if (sourceNode.type === 'conditional') {
      const outgoingEdges = existingEdges.filter(edge => edge.source === sourceNode.id);
      const maxConditions = 8; // Reasonable limit for conditional branches
      
      if (outgoingEdges.length >= maxConditions) {
        return { valid: false, error: `Conditional node cannot have more than ${maxConditions} outgoing connections` };
      }
    }

    console.log(`✅ Connection validation passed: ${sourceNode.label} -> ${targetNode.label}`);
    return { valid: true };
  }, [findPath]);

  const generateConditionalEdgeData = useCallback((sourceNode: EnhancedNode, existingEdges: EnhancedEdge[]): EdgeCondition | null => {
    if (sourceNode.type !== 'conditional') return null;

    const outgoingEdges = existingEdges.filter(edge => edge.source === sourceNode.id);
    const nextPriority = outgoingEdges.length + 1;
    
    return {
      functionName: `condition_${nextPriority}`,
      expression: `// Define your condition here\nreturn true; // Replace with actual condition`,
      priority: nextPriority,
      isDefault: false
    };
  }, []);

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
    };

    // Add conditional metadata for conditional nodes
    if (sourceNode.type === 'conditional') {
      const condition = generateConditionalEdgeData(sourceNode, edges);
      if (condition) {
        newEdge.conditional = {
          condition,
          sourceNodeType: 'conditional',
          evaluationMode: 'first-match'
        };
        newEdge.label = condition.functionName;
      }
    }

    setEdges(prev => [...prev, newEdge]);
    console.log(`✅ Edge added successfully:`, newEdge);
    return { success: true, edge: newEdge };
  }, [edges, validateConnection, generateConditionalEdgeData]);

  const updateEdgeProperties = useCallback((edgeId: string, updates: Partial<EnhancedEdge>) => {
    setEdges(prev => prev.map(edge => 
      edge.id === edgeId ? { ...edge, ...updates } : edge
    ));
  }, []);

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
  }, []);

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
  }, []);

  const deleteEdge = useCallback((edgeId: string) => {
    setEdges(prev => prev.filter(edge => edge.id !== edgeId));
    if (selectedEdgeId === edgeId) {
      setSelectedEdgeId(null);
    }
  }, [selectedEdgeId]);

  const deleteEdgesForNode = useCallback((nodeId: string) => {
    setEdges(prev => prev.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedEdgeId && edges.some(edge => edge.id === selectedEdgeId && (edge.source === nodeId || edge.target === nodeId))) {
      setSelectedEdgeId(null);
    }
  }, [selectedEdgeId, edges]);

  const selectEdge = useCallback((edgeId: string | null) => {
    setSelectedEdgeId(edgeId);
  }, []);

  const selectedEdge = selectedEdgeId ? edges.find(edge => edge.id === selectedEdgeId) : null;

  const canCreateEdge = useCallback((sourceNode: EnhancedNode) => {
    return sourceNode.type !== 'end';
  }, []);

  const getNodeOutgoingEdges = useCallback((nodeId: string) => {
    return edges.filter(edge => edge.source === nodeId)
      .sort((a, b) => {
        if (a.conditional && b.conditional) {
          return a.conditional.condition.priority - b.conditional.condition.priority;
        }
        return 0;
      });
  }, [edges]);

  const getConditionalNodeEdges = useCallback((nodeId: string) => {
    return edges.filter(edge => edge.source === nodeId && edge.conditional);
  }, [edges]);

  return {
    edges,
    selectedEdge,
    selectedEdgeId,
    addEdge,
    updateEdgeProperties,
    updateEdgeCondition,
    reorderConditionalEdges,
    deleteEdge,
    deleteEdgesForNode,
    selectEdge,
    validateConnection,
    canCreateEdge,
    getNodeOutgoingEdges,
    getConditionalNodeEdges
  };
};
