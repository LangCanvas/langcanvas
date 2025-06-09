
import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { ValidationResult } from '../../../utils/graphValidation';

interface ToolbarValidationProps {
  validationResult?: ValidationResult;
  hasNodes: boolean;
}

const ToolbarValidation: React.FC<ToolbarValidationProps> = ({
  validationResult,
  hasNodes
}) => {
  if (!validationResult || !hasNodes) return null;

  return (
    <div className="hidden sm:flex items-center">
      {validationResult.errorCount > 0 ? (
        <div className="flex items-center text-red-600 text-sm">
          <AlertTriangle className="w-4 h-4 mr-1" />
          <span>{validationResult.errorCount} error{validationResult.errorCount !== 1 ? 's' : ''}</span>
        </div>
      ) : validationResult.warningCount > 0 ? (
        <div className="flex items-center text-orange-600 text-sm">
          <AlertTriangle className="w-4 h-4 mr-1" />
          <span>{validationResult.warningCount} warning{validationResult.warningCount !== 1 ? 's' : ''}</span>
        </div>
      ) : (
        <div className="flex items-center text-green-600 text-sm">
          <CheckCircle className="w-4 h-4 mr-1" />
          <span>Valid</span>
        </div>
      )}
    </div>
  );
};

export default ToolbarValidation;
