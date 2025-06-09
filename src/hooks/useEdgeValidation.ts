
import { useCallback } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { EnhancedEdge } from '../types/edgeTypes';

export const useEdgeValidation = () => {
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

    if (sourceNode.type === 'conditional') {
      const outgoingEdges = existingEdges.filter(edge => edge.source === sourceNode.id);
      const maxConditions = 8;
      
      if (outgoingEdges.length >= maxConditions) {
        return { valid: false, error: `Conditional node cannot have more than ${maxConditions} outgoing connections` };
      }
    }

    console.log(`✅ Connection validation passed: ${sourceNode.label} -> ${targetNode.label}`);
    return { valid: true };
  }, [findPath]);

  return {
    validateConnection,
    findPath
  };
};
