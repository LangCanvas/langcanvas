
import { useState, useCallback, useEffect } from 'react';
import { EnhancedNode, NodeType } from '../types/nodeTypes';
import { createDefaultNode } from '../utils/nodeDefaults';
import { saveWorkflowToStorage, loadWorkflowFromStorage } from '../utils/workflowStorage';

export const useEnhancedNodes = () => {
  const [nodes, setNodes] = useState<EnhancedNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load nodes from localStorage on mount
  useEffect(() => {
    const { nodes: storedNodes } = loadWorkflowFromStorage();
    if (storedNodes.length > 0) {
      setNodes(storedNodes);
      console.log('📂 Loaded', storedNodes.length, 'nodes from storage');
    }
    setIsLoaded(true);
  }, []);

  // Save nodes to localStorage whenever they change (but not on initial load)
  useEffect(() => {
    if (isLoaded) {
      // Get current edges from storage to save together
      const { edges } = loadWorkflowFromStorage();
      saveWorkflowToStorage(nodes, edges);
    }
  }, [nodes, isLoaded]);

  const addNode = useCallback((type: NodeType, x: number, y: number) => {
    // Prevent adding multiple start nodes
    if (type === 'start' && nodes.some(node => node.type === 'start')) {
      alert('A workflow can only have one Start node.');
      return null;
    }

    const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNode = createDefaultNode(id, type, x, y);
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
