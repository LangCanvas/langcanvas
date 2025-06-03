
// Legacy hook - kept for backward compatibility only
// New code should use useEnhancedNodes instead

import { useState, useCallback } from 'react';

export interface Node {
  id: string;
  name: string;
  type: 'start' | 'tool' | 'condition' | 'end';
  x: number;
  y: number;
  description?: string;
  conditionVariable?: string;
}

export const useNodes = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const generateNodeName = useCallback((type: string, existingNodes: Node[]) => {
    if (type === 'start') return 'Start';
    
    const sameTypeNodes = existingNodes.filter(n => n.type === type);
    const nextNumber = sameTypeNodes.length + 1;
    
    switch (type) {
      case 'tool':
        return `Tool${nextNumber}`;
      case 'condition':
        return `Condition${nextNumber}`;
      case 'end':
        return `End${nextNumber}`;
      default:
        return `Node${nextNumber}`;
    }
  }, []);

  const addNode = useCallback((type: Node['type'], x: number, y: number) => {
    // Prevent adding multiple start nodes
    if (type === 'start' && nodes.some(node => node.type === 'start')) {
      alert('A workflow can only have one Start node.');
      return null;
    }

    const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const name = generateNodeName(type, nodes);
    
    const newNode: Node = {
      id,
      name,
      type,
      x,
      y,
      description: '',
      conditionVariable: type === 'condition' ? '' : undefined
    };

    setNodes(prev => [...prev, newNode]);
    return newNode;
  }, [nodes, generateNodeName]);

  const updateNodePosition = useCallback((id: string, x: number, y: number) => {
    setNodes(prev => prev.map(node => 
      node.id === id ? { ...node, x, y } : node
    ));
  }, []);

  const updateNodeProperties = useCallback((id: string, updates: Partial<Node>) => {
    setNodes(prev => prev.map(node => 
      node.id === id ? { ...node, ...updates } : node
    ));
  }, []);

  const deleteNode = useCallback((id: string) => {
    setNodes(prev => prev.filter(node => node.id !== id));
    if (selectedNodeId === id) {
      setSelectedNodeId(null);
    }
  }, [selectedNodeId]);

  const selectNode = useCallback((id: string | null) => {
    setSelectedNodeId(id);
  }, []);

  const selectedNode = selectedNodeId ? nodes.find(node => node.id === selectedNodeId) : null;

  return {
    nodes,
    selectedNode,
    selectedNodeId,
    addNode,
    updateNodePosition,
    updateNodeProperties,
    deleteNode,
    selectNode
  };
};
