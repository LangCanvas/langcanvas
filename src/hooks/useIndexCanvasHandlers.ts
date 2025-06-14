
import { useCallback } from 'react';

interface UseIndexCanvasHandlersProps {
  updateNodeProperties: (id: string, updates: any) => void;
  updateEdgeProperties: (id: string, updates: any) => void;
}

export const useIndexCanvasHandlers = ({
  updateNodeProperties,
  updateEdgeProperties,
}: UseIndexCanvasHandlersProps) => {
  // Create a simple function that checks if edge can be created
  const canCreateEdge = useCallback((sourceNode: any) => {
    return true; // Simplified implementation
  }, []);

  // Simple event handlers for canvas
  const handleNodePositionChange = useCallback((id: string, x: number, y: number) => {
    updateNodeProperties(id, { x, y });
  }, [updateNodeProperties]);

  const handleEdgeUpdate = useCallback((id: string, updates: any) => {
    updateEdgeProperties(id, updates);
  }, [updateEdgeProperties]);

  return {
    canCreateEdge,
    handleNodePositionChange,
    handleEdgeUpdate,
  };
};
