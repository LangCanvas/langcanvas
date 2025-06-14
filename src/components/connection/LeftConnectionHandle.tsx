
import React from 'react';
import { EnhancedNode } from '../../types/nodeTypes';

interface LeftConnectionHandleProps {
  node: EnhancedNode;
  isVisible?: boolean;
}

const LeftConnectionHandle: React.FC<LeftConnectionHandleProps> = ({ 
  node, 
  isVisible = true 
}) => {
  if (!isVisible || node.type === 'start') return null;

  const handleStyle = node.type === 'conditional' ? {
    position: 'absolute' as const,
    left: '-12px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#6b7280',
    border: '2px solid white',
    zIndex: 20,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  } : {
    position: 'absolute' as const,
    left: '-6px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#6b7280',
    border: '2px solid white',
    zIndex: 20,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  return (
    <div
      style={handleStyle}
      title="Connection target"
      data-handle="left"
      data-node-id={node.id}
    />
  );
};

export default LeftConnectionHandle;
