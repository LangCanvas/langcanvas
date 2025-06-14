
import { useCallback, useEffect } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { EnhancedEdge } from '../types/edgeTypes';
import { useValidation } from './useValidation';
import { toast } from 'sonner';

interface UseRealTimeValidationProps {
  nodes: EnhancedNode[];
  edges: EnhancedEdge[];
  enableRealTimeValidation?: boolean;
}

export const useRealTimeValidation = ({ 
  nodes, 
  edges, 
  enableRealTimeValidation = true 
}: UseRealTimeValidationProps) => {
  const validation = useValidation({ nodes, edges });

  const validateConnectionAttempt = useCallback((
    sourceNode: EnhancedNode, 
    targetNode: EnhancedNode
  ): { isValid: boolean; errorMessage?: string; warningMessage?: string } => {
    // Self-connection check
    if (sourceNode.id === targetNode.id) {
      return { 
        isValid: false, 
        errorMessage: "Cannot connect a node to itself" 
      };
    }

    // End node outgoing connection check
    if (sourceNode.type === 'end') {
      return { 
        isValid: false, 
        errorMessage: "End nodes cannot have outgoing connections" 
      };
    }

    // Start node incoming connection check
    if (targetNode.type === 'start') {
      return { 
        isValid: false, 
        errorMessage: "Start nodes cannot have incoming connections" 
      };
    }

    // Duplicate connection check
    const existingConnection = edges.find(edge => 
      edge.source === sourceNode.id && edge.target === targetNode.id
    );
    if (existingConnection) {
      return { 
        isValid: false, 
        errorMessage: "This connection already exists" 
      };
    }

    // Cycle detection
    const wouldCreateCycle = checkForCycle(sourceNode.id, targetNode.id, edges);
    if (wouldCreateCycle) {
      return { 
        isValid: false, 
        errorMessage: "This connection would create a cycle, which is not allowed" 
      };
    }

    // Tool node multiple outputs check
    if (sourceNode.type === 'tool') {
      const existingOutputs = edges.filter(edge => edge.source === sourceNode.id);
      if (existingOutputs.length > 0) {
        return { 
          isValid: false, 
          errorMessage: "Tool nodes can only have one output connection" 
        };
      }
    }

    // Conditional node connection limit check
    if (sourceNode.type === 'conditional') {
      const existingOutputs = edges.filter(edge => edge.source === sourceNode.id);
      if (existingOutputs.length >= 8) {
        return { 
          isValid: false, 
          errorMessage: "Conditional nodes cannot have more than 8 output connections" 
        };
      }
    }

    return { isValid: true };
  }, [edges]);

  const checkForCycle = useCallback((sourceId: string, targetId: string, currentEdges: EnhancedEdge[]): boolean => {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recursionStack.add(nodeId);

      // Simulate the new edge
      const edgesToCheck = [...currentEdges];
      if (nodeId === sourceId) {
        edgesToCheck.push({ 
          id: 'temp', 
          source: sourceId, 
          target: targetId 
        } as EnhancedEdge);
      }

      const outgoingEdges = edgesToCheck.filter(edge => edge.source === nodeId);
      for (const edge of outgoingEdges) {
        if (dfs(edge.target)) return true;
      }

      recursionStack.delete(nodeId);
      return false;
    };

    return dfs(targetId);
  }, []);

  const showValidationToast = useCallback((
    type: 'error' | 'warning' | 'success',
    message: string
  ) => {
    if (!enableRealTimeValidation) return;

    switch (type) {
      case 'error':
        toast.error('Connection Error', { description: message });
        break;
      case 'warning':
        toast.warning('Connection Warning', { description: message });
        break;
      case 'success':
        toast.success('Connection Valid', { description: message });
        break;
    }
  }, [enableRealTimeValidation]);

  return {
    ...validation,
    validateConnectionAttempt,
    showValidationToast,
    checkForCycle
  };
};
