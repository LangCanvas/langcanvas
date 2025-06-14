
import { useCallback } from 'react';
import { EnhancedEdge, LoopEdgeMetadata, LoopType, LoopCondition } from '../types/edgeTypes';

export const useLoopManagement = () => {
  const createLoopMetadata = useCallback((
    loopType: LoopType,
    sourceNodeType: string,
    loopCondition: Partial<LoopCondition> = {}
  ): LoopEdgeMetadata => {
    const defaultCondition: LoopCondition = {
      maxIterations: loopType === 'unconditional' ? 100 : undefined,
      enableHumanInterrupt: loopType === 'human-in-loop',
      iterationCounter: 0,
      ...loopCondition
    };

    return {
      loopType,
      loopCondition: defaultCondition,
      isLoopEdge: true,
      sourceNodeType
    };
  }, []);

  const updateLoopCondition = useCallback((
    edge: EnhancedEdge,
    updates: Partial<LoopCondition>
  ): EnhancedEdge => {
    if (!edge.loop) return edge;

    return {
      ...edge,
      loop: {
        ...edge.loop,
        loopCondition: {
          ...edge.loop.loopCondition,
          ...updates
        }
      }
    };
  }, []);

  const getLoopSafetyStatus = useCallback((edge: EnhancedEdge): {
    status: 'safe' | 'warning' | 'dangerous';
    message: string;
  } => {
    if (!edge.loop) {
      return { status: 'safe', message: 'Not a loop edge' };
    }

    const { loopCondition } = edge.loop;
    
    if (!loopCondition.terminationExpression && !loopCondition.maxIterations) {
      return { 
        status: 'dangerous', 
        message: 'No termination condition - infinite loop risk' 
      };
    }

    if (loopCondition.maxIterations && loopCondition.maxIterations > 1000) {
      return { 
        status: 'warning', 
        message: 'High iteration limit - consider reducing' 
      };
    }

    return { status: 'safe', message: 'Loop has proper safeguards' };
  }, []);

  const getLoopDisplayLabel = useCallback((edge: EnhancedEdge): string => {
    if (!edge.loop) return edge.label || '';

    const { loopType, loopCondition } = edge.loop;
    let label = `${loopType} loop`;

    if (loopCondition.maxIterations) {
      label += ` (max: ${loopCondition.maxIterations})`;
    }

    if (loopCondition.enableHumanInterrupt) {
      label += ' 🚸';
    }

    return label;
  }, []);

  return {
    createLoopMetadata,
    updateLoopCondition,
    getLoopSafetyStatus,
    getLoopDisplayLabel
  };
};
