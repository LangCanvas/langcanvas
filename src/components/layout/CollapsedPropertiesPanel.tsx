
import React from 'react';
import { PanelRight, AlertTriangle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  validationResult,
  onExpand
}) => {
  console.log('🎛️ CollapsedPropertiesPanel rendering');

  const hasIssues = validationResult.errorCount > 0 || validationResult.warningCount > 0;

  return (
    <div className="flex flex-col items-center justify-start py-4 bg-background border-l border-border h-full">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          console.log('🎛️ Expand button clicked in CollapsedPropertiesPanel');
          onExpand();
        }}
        className="w-10 h-10 p-0 hover:bg-accent mb-2"
        title="Expand Properties Panel"
      >
        <PanelRight className="w-4 h-4" />
      </Button>

      {hasIssues && (
        <div className="flex flex-col items-center gap-1">
          {validationResult.errorCount > 0 && (
            <Badge variant="destructive" className="text-xs px-1 py-0 min-w-0 h-5 flex items-center justify-center">
              <XCircle className="w-3 h-3 mr-1" />
              {validationResult.errorCount}
            </Badge>
          )}
          {validationResult.warningCount > 0 && (
            <Badge variant="secondary" className="text-xs px-1 py-0 min-w-0 h-5 flex items-center justify-center bg-orange-100 text-orange-800 border-orange-200">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {validationResult.warningCount}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default CollapsedPropertiesPanel;
