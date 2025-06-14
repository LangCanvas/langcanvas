
import { useCallback } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { EnhancedEdge, LoopType } from '../types/edgeTypes';

export const useLoopValidation = () => {
  const isValidLoopConnection = useCallback((
    sourceNode: EnhancedNode, 
    targetNode: EnhancedNode, 
    existingEdges: EnhancedEdge[]
  ): { valid: boolean; isLoop: boolean; loopType?: LoopType; error?: string } => {
    console.log(`🔍 Validating loop connection: ${sourceNode.label} -> ${targetNode.label}`);
    
    // Basic validation
    if (sourceNode.id === targetNode.id) {
      return { 
        valid: true, 
        isLoop: true, 
        loopType: 'self-loop' 
      };
    }

    if (sourceNode.type === 'end') {
      return { 
        valid: false, 
        isLoop: false, 
        error: "End node cannot have outgoing connections" 
      };
    }

    // Check for duplicate edge
    const duplicateEdge = existingEdges.find(edge => 
      edge.source === sourceNode.id && edge.target === targetNode.id
    );
    if (duplicateEdge) {
      return { 
        valid: false, 
        isLoop: false, 
        error: "This connection already exists" 
      };
    }

    // Check if this would create a loop
    const wouldCreateLoop = findPath(targetNode.id, sourceNode.id, existingEdges);
    
    if (wouldCreateLoop) {
      // Determine loop type based on node types
      let loopType: LoopType = 'unconditional';
      
      if (sourceNode.type === 'conditional') {
        loopType = 'conditional';
      } else if (sourceNode.type === 'tool' || targetNode.type === 'tool') {
        loopType = 'tool-based';
      }
      
      console.log(`✅ Loop connection detected: ${loopType}`);
      return { 
        valid: true, 
        isLoop: true, 
        loopType 
      };
    }

    return { valid: true, isLoop: false };
  }, []);

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

  const validateLoopSafety = useCallback((edge: EnhancedEdge): { safe: boolean; warnings: string[] } => {
    const warnings: string[] = [];
    
    if (edge.loop) {
      const { loopCondition } = edge.loop;
      
      if (!loopCondition.terminationExpression && !loopCondition.maxIterations) {
        warnings.push('Loop has no termination condition - may run indefinitely');
      }
      
      if (loopCondition.maxIterations && loopCondition.maxIterations > 1000) {
        warnings.push('Very high iteration limit - consider reducing for safety');
      }
    }
    
    return { safe: warnings.length === 0, warnings };
  }, []);

  return {
    isValidLoopConnection,
    findPath,
    validateLoopSafety
  };
};
