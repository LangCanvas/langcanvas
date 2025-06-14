
import React from 'react';
import { EnhancedNode } from '../../types/nodeTypes';

interface ConnectionConstraintsProps {
  sourceNode: EnhancedNode;
  nodes: EnhancedNode[];
  children: (isValidTarget: (targetNode: EnhancedNode) => boolean) => React.ReactNode;
}

const ConnectionConstraints: React.FC<ConnectionConstraintsProps> = ({
  sourceNode,
  nodes,
  children
}) => {
  const isValidTarget = (targetNode: EnhancedNode): boolean => {
    // Cannot connect to self
    if (sourceNode.id === targetNode.id) return false;

    // End nodes cannot be sources
    if (sourceNode.type === 'end') return false;

    // Start nodes cannot be targets
    if (targetNode.type === 'start') return false;

    // Type-specific constraints
    switch (sourceNode.type) {
      case 'start':
        // Start nodes can connect to any valid target
        return targetNode.type !== 'start';
        
      case 'tool':
        // Tool nodes can connect to any valid target
        return targetNode.type !== 'start';
        
      case 'agent':
        // Agent nodes can connect to tools, conditions, or end
        return ['tool', 'conditional', 'end'].includes(targetNode.type);
        
      case 'function':
        // Function nodes can connect to any valid target
        return targetNode.type !== 'start';
        
      case 'conditional':
        // Conditional nodes can connect to any valid target
        return targetNode.type !== 'start';
        
      case 'parallel':
        // Parallel nodes can connect to any valid target
        return targetNode.type !== 'start';
        
      default:
        return true;
    }
  };

  return <>{children(isValidTarget)}</>;
};

export default ConnectionConstraints;
