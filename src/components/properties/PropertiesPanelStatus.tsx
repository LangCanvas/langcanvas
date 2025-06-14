
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, Clock, Save } from 'lucide-react';

interface PropertiesPanelStatusProps {
  isValid: boolean;
  hasChanges: boolean;
  isValidating: boolean;
  isSaving: boolean;
  errorCount: number;
  warningCount: number;
}

const PropertiesPanelStatus: React.FC<PropertiesPanelStatusProps> = ({
  isValid,
  hasChanges,
  isValidating,
  isSaving,
  errorCount,
  warningCount
}) => {
  if (isSaving) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
        <Save className="w-4 h-4 text-blue-600 animate-pulse" />
        <span className="text-sm text-blue-800 font-medium">Saving changes...</span>
      </div>
    );
  }

  if (isValidating) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
        <Clock className="w-4 h-4 text-gray-600 animate-spin" />
        <span className="text-sm text-gray-700">Validating...</span>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="flex items-center justify-between px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-800 font-medium">Validation errors</span>
        </div>
        <div className="flex space-x-1">
          {errorCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {errorCount} errors
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
              {warningCount} warnings
            </Badge>
          )}
        </div>
      </div>
    );
  }

  if (hasChanges) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
        <span className="text-sm text-orange-800">Unsaved changes</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
      <CheckCircle2 className="w-4 h-4 text-green-600" />
      <span className="text-sm text-green-800 font-medium">All fields valid</span>
    </div>
  );
};

export default PropertiesPanelStatus;
