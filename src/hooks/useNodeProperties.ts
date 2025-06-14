
import { useCallback } from 'react';
import { EnhancedNode } from '../types/nodeTypes'; // Updated import
import { EnhancedEdge } from '../types/edgeTypes'; // Updated import

export const useNodeProperties = () => {
  const validateNodeName = useCallback((name: string, currentNodeId: string, allNodes: EnhancedNode[]): { valid: boolean; error?: string } => { // Changed Node[] to EnhancedNode[]
    // Check if name is empty
    if (!name.trim()) {
      return { valid: false, error: "Name cannot be empty" };
    }

    // Check if name follows valid identifier pattern
    const validNamePattern = /^[A-Za-z_]\w*$/;
    if (!validNamePattern.test(name.trim())) {
      return { valid: false, error: "Name must start with a letter or underscore and contain only letters, numbers, and underscores" };
    }

    // Check for reserved names (using the new 'label' which corresponds to 'name')
    if (name.toLowerCase() === 'end') {
      return { valid: false, error: "Name 'END' is reserved" };
    }

    // Check for uniqueness using 'label'
    const isDuplicate = allNodes.some(node => 
      node.id !== currentNodeId && node.label.toLowerCase() === name.trim().toLowerCase() // Changed node.name to node.label
    );

    if (isDuplicate) {
      return { valid: false, error: "Name must be unique among all nodes" };
    }

    return { valid: true };
  }, []);

  const validateBranchLabel = useCallback((label: string, edgeId: string, nodeEdges: EnhancedEdge[]): { valid: boolean; error?: string } => { // Changed Edge[] to EnhancedEdge[]
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
    // This function sanitizes a string, typically used for labels/names.
    // No change needed here as it operates on a generic string.
    return name.replace(/[^A-Za-z0-9_]/g, '_').replace(/^[0-9]/, '_$&');
  }, []);

  return {
    validateNodeName,
    validateBranchLabel,
    sanitizeNodeName
  };
};
