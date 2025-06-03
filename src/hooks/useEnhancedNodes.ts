
import { useState, useCallback } from 'react';
import { EnhancedNode, NodeType } from '../types/nodeTypes';
import { createDefaultNode } from '../utils/nodeDefaults';

export const useEnhancedNodes = () => {
  const [nodes, setNodes] = useState<EnhancedNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const addNode = useCallback((type: NodeType, x: number, y: number) => {
    // Prevent adding multiple start nodes (treating 'agent' as start equivalent)
    if (type === 'agent' && nodes.some(node => node.type === 'agent')) {
      alert('A workflow can only have one Agent (start) node.');
      return null;
    }

    const newNode = createDefaultNode(type, x, y);
    setNodes(prev => [...prev, newNode]);
    return newNode;
  }, [nodes]);

  const updateNodePosition = useCallback((id: string, x: number, y: number) => {
    setNodes(prev => prev.map(node => 
      node.id === id ? { ...node, x, y } : node
    ));
  }, []);

  const updateNodeProperties = useCallback((id: string, updates: Partial<EnhancedNode>) => {
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
