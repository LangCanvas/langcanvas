
import { useState, useCallback } from 'react';
import { Node } from './useNodes';

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

  const validateConnection = useCallback((sourceNode: Node, targetNode: Node, existingEdges: Edge[]): { valid: boolean; error?: string } => {
    // Cannot connect to self
    if (sourceNode.id === targetNode.id) {
      return { valid: false, error: "Cannot connect a node to itself" };
    }

    // Start node cannot be a target
    if (targetNode.type === 'start') {
      return { valid: false, error: "Start node cannot have incoming connections" };
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

    // Start and Tool nodes can only have one outgoing edge
    if (sourceNode.type === 'start' || sourceNode.type === 'tool') {
      const existingOutgoing = existingEdges.filter(edge => edge.source === sourceNode.id);
      if (existingOutgoing.length > 0) {
        const nodeTypeName = sourceNode.type === 'start' ? 'Start' : 'Tool';
        return { 
          valid: false, 
          error: `${nodeTypeName} nodes can only have one outgoing connection${sourceNode.type === 'tool' ? '; use a Condition for branching' : ''}` 
        };
      }
    }

    // Check for cycles
    if (findPath(targetNode.id, sourceNode.id, existingEdges)) {
      return { valid: false, error: "This connection would create a cycle, which is not allowed" };
    }

    return { valid: true };
  }, [findPath]);

  const generateBranchLabel = useCallback((sourceNodeType: string, existingEdges: Edge[], sourceNodeId: string): string => {
    if (sourceNodeType === 'condition') {
      const outgoingEdges = existingEdges.filter(edge => edge.source === sourceNodeId);
      return `Branch${outgoingEdges.length + 1}`;
    }
    return '';
  }, []);

  const addEdge = useCallback((sourceNode: Node, targetNode: Node) => {
    const validation = validateConnection(sourceNode, targetNode, edges);
    
    if (!validation.valid) {
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

  const canCreateEdge = useCallback((sourceNode: Node) => {
    if (sourceNode.type === 'end') return false;
    if (sourceNode.type === 'start' || sourceNode.type === 'tool') {
      return !edges.some(edge => edge.source === sourceNode.id);
    }
    return true; // Condition nodes can have multiple outgoing edges
  }, [edges]);

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
