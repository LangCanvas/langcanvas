
import { useState, useCallback } from 'react';

export interface DataFlowParticle {
  id: string;
  edgeId: string;
  position: number; // 0 to 1 along the path
  speed: number;
  active: boolean;
}

export const useDataFlowParticles = (animationsEnabled: boolean) => {
  const [dataFlowParticles, setDataFlowParticles] = useState<Map<string, DataFlowParticle[]>>(new Map());

  const startDataFlow = useCallback((edgeId: string, particleCount: number = 3) => {
    if (!animationsEnabled) return;
    
    const particles: DataFlowParticle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: `${edgeId}-particle-${i}`,
      edgeId,
      position: i * (1 / particleCount),
      speed: 0.5 + Math.random() * 0.5, // Vary speed slightly
      active: true
    }));

    setDataFlowParticles(prev => new Map(prev).set(edgeId, particles));
  }, [animationsEnabled]);

  const stopDataFlow = useCallback((edgeId: string) => {
    setDataFlowParticles(prev => {
      const next = new Map(prev);
      next.delete(edgeId);
      return next;
    });
  }, []);

  const getDataFlowParticles = useCallback((edgeId: string): DataFlowParticle[] => {
    return dataFlowParticles.get(edgeId) || [];
  }, [dataFlowParticles]);

  return {
    dataFlowParticles,
    setDataFlowParticles,
    startDataFlow,
    stopDataFlow,
    getDataFlowParticles
  };
};
