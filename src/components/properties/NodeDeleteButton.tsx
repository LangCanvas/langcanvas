
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface NodeDeleteButtonProps {
  onDeleteNode: () => void;
}

const NodeDeleteButton: React.FC<NodeDeleteButtonProps> = ({ onDeleteNode }) => {
  return (
    <div className="pt-4 border-t border-gray-200">
      <Button
        variant="destructive"
        onClick={onDeleteNode}
        className="w-full"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete Node
      </Button>
    </div>
  );
};

export default NodeDeleteButton;
