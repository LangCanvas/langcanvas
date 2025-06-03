
import React, { useEffect } from 'react';

interface KeyboardHandlerProps {
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
}

const KeyboardHandler: React.FC<KeyboardHandlerProps> = ({
  selectedNodeId,
  selectedEdgeId,
  onDeleteNode,
  onDeleteEdge
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete') {
        event.preventDefault();
        if (selectedNodeId) {
          onDeleteNode(selectedNodeId);
        } else if (selectedEdgeId) {
          onDeleteEdge(selectedEdgeId);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, selectedEdgeId, onDeleteNode, onDeleteEdge]);

  return null; // This component doesn't render anything
};

export default KeyboardHandler;
