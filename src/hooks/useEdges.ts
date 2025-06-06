import { useState, useCallback } from 'react';
import { EnhancedNode } from '../types/nodeTypes';

export interface Edge {
  id: string;
  source: string;
  target: string;
  label?: string;
  value?: string;
}

export const useEdges = () => {
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const findPath = useCallback((start: string, target: string, edges: Edge[]): boolean => {
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

  const validateConnection = useCallback((sourceNode: EnhancedNode, targetNode: EnhancedNode, existingEdges: Edge[]): { valid: boolean; error?: string } => {
    console.log(`🔍 Validating connection: ${sourceNode.label} (${sourceNode.type}) -> ${targetNode.label} (${targetNode.type})`);
    
    // Cannot connect to self
    if (sourceNode.id === targetNode.id) {
      return { valid: false, error: "Cannot connect a node to itself" };
    }

    // End node cannot be a source
    if (sourceNode.type === 'end') {
      return { valid: false, error: "End node cannot have outgoing connections" };
    }

    // Check for duplicate edge
    const duplicateEdge = existingEdges.find(edge => 
      edge.source === sourceNode.id && edge.target === targetNode.id
    );
    if (duplicateEdge) {
      return { valid: false, error: "This connection already exists" };
    }

    // Check for cycles
    if (findPath(targetNode.id, sourceNode.id, existingEdges)) {
      return { valid: false, error: "This connection would create a cycle, which is not allowed" };
    }

    console.log(`✅ Connection validation passed: ${sourceNode.label} -> ${targetNode.label}`);
    return { valid: true };
  }, [findPath]);

  const generateBranchLabel = useCallback((sourceNodeType: string, existingEdges: Edge[], sourceNodeId: string): string => {
    if (sourceNodeType === 'conditional') {
      const outgoingEdges = existingEdges.filter(edge => edge.source === sourceNodeId);
      return `Branch${outgoingEdges.length + 1}`;
    }
    return '';
  }, []);

  const addEdge = useCallback((sourceNode: EnhancedNode, targetNode: EnhancedNode) => {
    console.log(`🔗 Attempting to add edge: ${sourceNode.label} -> ${targetNode.label}`);
    
    const validation = validateConnection(sourceNode, targetNode, edges);
    
    if (!validation.valid) {
      console.error(`❌ Edge validation failed: ${validation.error}`);
      return { success: false, error: validation.error };
    }

    const id = `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const label = generateBranchLabel(sourceNode.type, edges, sourceNode.id);
    
    const newEdge: Edge = {
      id,
      source: sourceNode.id,
      target: targetNode.id,
      label: label || undefined
    };

    setEdges(prev => [...prev, newEdge]);
    console.log(`✅ Edge added successfully:`, newEdge);
    return { success: true, edge: newEdge };
  }, [edges, validateConnection, generateBranchLabel]);

  const updateEdgeProperties = useCallback((edgeId: string, updates: Partial<Edge>) => {
    setEdges(prev => prev.map(edge => 
      edge.id === edgeId ? { ...edge, ...updates } : edge
    ));
  }, []);

  const deleteEdge = useCallback((edgeId: string) => {
    setEdges(prev => prev.filter(edge => edge.id !== edgeId));
    if (selectedEdgeId === edgeId) {
      setSelectedEdgeId(null);
    }
  }, [selectedEdgeId]);

  const deleteEdgesForNode = useCallback((nodeId: string) => {
    setEdges(prev => prev.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedEdgeId && edges.some(edge => edge.id === selectedEdgeId && (edge.source === nodeId || edge.target === nodeId))) {
      setSelectedEdgeId(null);
    }
  }, [selectedEdgeId, edges]);

  const updateEdgesForNodeRename = useCallback((oldNodeId: string, newNodeId: string) => {
    // Note: This is for if we used names as IDs, but we use unique IDs
    // This function would update edge references if needed
    console.log('Node rename detected:', oldNodeId, '->', newNodeId);
  }, []);

  const selectEdge = useCallback((edgeId: string | null) => {
    setSelectedEdgeId(edgeId);
  }, []);

  const selectedEdge = selectedEdgeId ? edges.find(edge => edge.id === selectedEdgeId) : null;

  const canCreateEdge = useCallback((sourceNode: EnhancedNode) => {
    // Only end nodes cannot create outgoing edges
    return sourceNode.type !== 'end';
  }, []);

  const getNodeOutgoingEdges = useCallback((nodeId: string) => {
    return edges.filter(edge => edge.source === nodeId);
  }, [edges]);

  return {
    edges,
    selectedEdge,
    selectedEdgeId,
    addEdge,
    updateEdgeProperties,
    deleteEdge,
    deleteEdgesForNode,
    updateEdgesForNodeRename,
    selectEdge,
    validateConnection,
    canCreateEdge,
    getNodeOutgoingEdges
  };
};
