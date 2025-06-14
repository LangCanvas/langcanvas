
import { useCallback } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { EnhancedEdge } from '../types/edgeTypes';
import { useLoopValidation } from './useLoopValidation';

export const useEdgeValidation = () => {
  const { isValidLoopConnection } = useLoopValidation();

  const validateConnection = useCallback((
    sourceNode: EnhancedNode, 
    targetNode: EnhancedNode, 
    existingEdges: EnhancedEdge[]
  ): { valid: boolean; error?: string; isLoop?: boolean; loopType?: string } => {
    console.log(`🔍 Validating connection: ${sourceNode.label} (${sourceNode.type}) -> ${targetNode.label} (${targetNode.type})`);
    
    // Use loop validation instead of blanket cycle prevention
    const loopValidation = isValidLoopConnection(sourceNode, targetNode, existingEdges);
    
    if (!loopValidation.valid) {
      return { valid: false, error: loopValidation.error };
    }

    // Additional LangGraph-specific validations
    if (sourceNode.type === 'conditional') {
      const outgoingEdges = existingEdges.filter(edge => edge.source === sourceNode.id);
      const maxConditions = 8;
      
      if (outgoingEdges.length >= maxConditions) {
        return { 
          valid: false, 
          error: `Conditional node cannot have more than ${maxConditions} outgoing connections` 
        };
      }
    }

    console.log(`✅ Connection validation passed: ${sourceNode.label} -> ${targetNode.label}`);
    return { 
      valid: true, 
      isLoop: loopValidation.isLoop,
      loopType: loopValidation.loopType 
    };
  }, [isValidLoopConnection]);

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

  return {
    validateConnection,
    findPath
  };
};
