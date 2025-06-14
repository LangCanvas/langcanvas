
import { useCallback, useEffect } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { EnhancedEdge } from '../types/edgeTypes';
import { useValidation } from './useValidation';
import { useEdgeValidation } from './useEdgeValidation';
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
  const { validateConnection } = useEdgeValidation();

  const validateConnectionAttempt = useCallback((
    sourceNode: EnhancedNode, 
    targetNode: EnhancedNode
  ): { isValid: boolean; errorMessage?: string; warningMessage?: string } => {
    console.log(`🔍 Real-time validation: ${sourceNode.label} -> ${targetNode.label}`);

    // Use the new LangGraph-compatible validation
    const validationResult = validateConnection(sourceNode, targetNode, edges);
    
    if (!validationResult.valid) {
      console.log(`❌ Connection rejected: ${validationResult.error}`);
      return { 
        isValid: false, 
        errorMessage: validationResult.error 
      };
    }

    // Check for warnings on valid loop connections
    if (validationResult.isLoop) {
      console.log(`🔄 Loop connection detected: ${validationResult.loopType}`);
      return { 
        isValid: true,
        warningMessage: `Creating ${validationResult.loopType} loop - ensure proper termination conditions`
      };
    }

    console.log(`✅ Connection validated successfully`);
    return { isValid: true };
  }, [edges, validateConnection]);

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
    showValidationToast
  };
};
