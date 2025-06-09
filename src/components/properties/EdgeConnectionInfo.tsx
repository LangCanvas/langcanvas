
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { EnhancedNode } from '../../types/nodeTypes';

interface EdgeConnectionInfoProps {
  sourceNode?: EnhancedNode;
  targetNode?: EnhancedNode;
  priority: number;
  hasConflicts: boolean;
}

const EdgeConnectionInfo: React.FC<EdgeConnectionInfoProps> = ({
  sourceNode,
  targetNode,
  priority,
  hasConflicts
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Condition Properties</h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            Priority {priority}
          </Badge>
          {hasConflicts && (
            <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">
              <AlertCircle className="w-3 h-3 mr-1" />
              Error
            </Badge>
          )}
        </div>
      </div>
      
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span className="font-medium">From:</span>
            <span className="text-gray-800">{sourceNode?.label || 'Unknown'}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="font-medium">To:</span>
            <span className="text-gray-800">{targetNode?.label || 'Unknown'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EdgeConnectionInfo;
