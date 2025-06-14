
import { useState, useCallback } from 'react';
import { EnhancedEdge, LoopType, LoopCondition } from '../types/edgeTypes';
import { EnhancedNode } from '../types/nodeTypes';

interface LoopTemplate {
  id: string;
  name: string;
  description: string;
  loopType: LoopType;
  terminationCondition?: string;
  maxIterations?: number;
  enableHumanInterrupt?: boolean;
}

export const useLoopVisualization = () => {
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [selectedLoopEdge, setSelectedLoopEdge] = useState<EnhancedEdge | null>(null);

  const openTemplateLibrary = useCallback(() => {
    setShowTemplateLibrary(true);
  }, []);

  const closeTemplateLibrary = useCallback(() => {
    setShowTemplateLibrary(false);
  }, []);

  const openDebugPanel = useCallback((edge: EnhancedEdge) => {
    setSelectedLoopEdge(edge);
    setShowDebugPanel(true);
  }, []);

  const closeDebugPanel = useCallback(() => {
    setShowDebugPanel(false);
    setSelectedLoopEdge(null);
  }, []);

  const applyLoopTemplate = useCallback((
    template: LoopTemplate,
    sourceNode: EnhancedNode,
    targetNode: EnhancedNode,
    onCreateEdge: (sourceNode: EnhancedNode, targetNode: EnhancedNode, loopConfig: Partial<LoopCondition>) => void
  ) => {
    const loopConfig: Partial<LoopCondition> = {
      terminationExpression: template.terminationCondition,
      maxIterations: template.maxIterations,
      enableHumanInterrupt: template.enableHumanInterrupt,
      iterationCounter: 0
    };

    onCreateEdge(sourceNode, targetNode, loopConfig);
    closeTemplateLibrary();
  }, [closeTemplateLibrary]);

  const getLoopVisualizationProps = useCallback((edge: EnhancedEdge) => {
    if (!edge.loop) return null;

    const { loopType, loopCondition } = edge.loop;
    const hasTermination = Boolean(loopCondition.terminationExpression || loopCondition.maxIterations);
    const isHumanInterrupt = loopCondition.enableHumanInterrupt;
    const currentIteration = loopCondition.iterationCounter || 0;

    return {
      loopType,
      hasTermination,
      isHumanInterrupt,
      currentIteration,
      safetyLevel: hasTermination ? 'safe' : 'warning',
      displayBadge: true,
      animateFlow: true
    };
  }, []);

  const getLoopPerformanceStats = useCallback((edge: EnhancedEdge) => {
    if (!edge.loop) return null;

    // Mock performance data - in real implementation, this would come from execution tracking
    return {
      totalIterations: edge.loop.loopCondition.iterationCounter || 0,
      averageDuration: 120, // ms
      successRate: 85, // %
      memoryUsage: 256, // KB
      lastExecution: new Date(),
      isCurrentlyRunning: false
    };
  }, []);

  return {
    showTemplateLibrary,
    showDebugPanel,
    selectedLoopEdge,
    openTemplateLibrary,
    closeTemplateLibrary,
    openDebugPanel,
    closeDebugPanel,
    applyLoopTemplate,
    getLoopVisualizationProps,
    getLoopPerformanceStats
  };
};
