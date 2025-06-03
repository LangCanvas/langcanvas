
import { useCallback } from 'react';
import { Node } from './useNodes';
import { Edge } from './useEdges';

export const useNodeProperties = () => {
  const validateNodeName = useCallback((name: string, currentNodeId: string, allNodes: Node[]): { valid: boolean; error?: string } => {
    // Check if name is empty
    if (!name.trim()) {
      return { valid: false, error: "Name cannot be empty" };
    }

    // Check if name follows valid identifier pattern
    const validNamePattern = /^[A-Za-z_]\w*$/;
    if (!validNamePattern.test(name.trim())) {
      return { valid: false, error: "Name must start with a letter or underscore and contain only letters, numbers, and underscores" };
    }

    // Check for reserved names
    if (name.toLowerCase() === 'end') {
      return { valid: false, error: "Name 'END' is reserved" };
    }

    // Check for uniqueness
    const isDuplicate = allNodes.some(node => 
      node.id !== currentNodeId && node.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (isDuplicate) {
      return { valid: false, error: "Name must be unique among all nodes" };
    }

    return { valid: true };
  }, []);

  const validateBranchLabel = useCallback((label: string, edgeId: string, nodeEdges: Edge[]): { valid: boolean; error?: string } => {
    if (!label.trim()) {
      return { valid: false, error: "Branch label cannot be empty" };
    }

    // Check for duplicates within the same condition node
    const isDuplicate = nodeEdges.some(edge => 
      edge.id !== edgeId && edge.label?.toLowerCase() === label.trim().toLowerCase()
    );

    if (isDuplicate) {
      return { valid: false, error: "Branch labels must be unique within the same condition node" };
    }

    return { valid: true };
  }, []);

  const sanitizeNodeName = useCallback((name: string): string => {
    return name.replace(/[^A-Za-z0-9_]/g, '_').replace(/^[0-9]/, '_$&');
  }, []);

  return {
    validateNodeName,
    validateBranchLabel,
    sanitizeNodeName
  };
};
