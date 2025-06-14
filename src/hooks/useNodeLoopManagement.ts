
import { useCallback } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { NodeLoopConfig } from '../types/loopTypes';

interface UseNodeLoopManagementProps {
  onUpdateNode: (nodeId: string, updates: Partial<EnhancedNode>) => void;
}

export const useNodeLoopManagement = ({ onUpdateNode }: UseNodeLoopManagementProps) => {
  const updateNodeLoopConfig = useCallback((nodeId: string, loopConfig: NodeLoopConfig) => {
    console.log(`🔄 Updating loop config for node ${nodeId}:`, loopConfig);
    
    onUpdateNode(nodeId, {
      config: {
        timeout: 30,
        retry: {
          enabled: true,
          max_attempts: 3,
          delay: 5
        },
        concurrency: 'sequential',
        metadata: {
          tags: [],
          notes: ''
        },
        loop: loopConfig
      }
    });
  }, [onUpdateNode]);

  const getNodeLoopConfig = useCallback((node: EnhancedNode): NodeLoopConfig => {
    return node.config.loop || {
      enabled: false,
      loopType: 'self-loop',
      terminationConditions: [{
        type: 'max-iterations',
        value: 10,
        description: 'Maximum iterations limit'
      }],
      safetySettings: {
        emergencyStopConditions: [],
        performanceMonitoring: true,
        resourceUsageLimits: {
          memory: 512,
          cpu: 80,
          time: 300
        },
        executionLogging: true
      },
      humanIntervention: {
        manualApprovalPoints: [],
        breakpointInsertion: false,
        realTimeMonitoring: false,
        emergencyStopButton: true
      },
      warnings: []
    };
  }, []);

  const validateLoopConfig = useCallback((config: NodeLoopConfig): string[] => {
    const warnings: string[] = [];

    if (config.enabled) {
      // Check for missing termination conditions
      if (config.terminationConditions.length === 0) {
        warnings.push('No termination conditions defined - potential infinite loop');
      }

      // Check for very high iteration limits
      const maxIterationsCondition = config.terminationConditions.find(c => c.type === 'max-iterations');
      if (maxIterationsCondition && typeof maxIterationsCondition.value === 'number' && maxIterationsCondition.value > 1000) {
        warnings.push('Very high iteration limit may cause performance issues');
      }

      // Check resource limits
      if (config.safetySettings.resourceUsageLimits.memory < 128) {
        warnings.push('Memory limit may be too low for stable execution');
      }

      if (config.safetySettings.resourceUsageLimits.time < 30) {
        warnings.push('Time limit may be too restrictive');
      }
    }

    return warnings;
  }, []);

  return {
    updateNodeLoopConfig,
    getNodeLoopConfig,
    validateLoopConfig
  };
};
