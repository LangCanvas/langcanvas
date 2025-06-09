
import React from 'react';
import { PanelRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EnhancedNode } from '../../types/nodeTypes';
import { EnhancedEdge } from '../../types/edgeTypes';
import { ValidationResult } from '../../hooks/useValidation';

interface CollapsedPropertiesPanelProps {
  selectedNode: EnhancedNode | null;
  selectedEdge: EnhancedEdge | null;
  validationResult: ValidationResult;
  onExpand: () => void;
}

const CollapsedPropertiesPanel: React.FC<CollapsedPropertiesPanelProps> = ({
  onExpand
}) => {
  console.log('🎛️ CollapsedPropertiesPanel rendering');

  return (
    <div className="flex flex-col items-center justify-start py-4 bg-background border-l border-border h-full">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log('🎛️ Expand button clicked in CollapsedPropertiesPanel');
          onExpand();
        }}
        className="w-10 h-10 p-0 hover:bg-accent"
        title="Expand Properties Panel"
      >
        <PanelRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default CollapsedPropertiesPanel;
