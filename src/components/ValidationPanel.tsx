
import React from 'react';
import { AlertTriangle, XCircle, AlertCircle } from 'lucide-react';
import { ValidationResult } from '../utils/graphValidation';

interface ValidationPanelProps {
  validationResult: ValidationResult;
  onClose?: () => void;
  compact?: boolean;
}

const ValidationPanel: React.FC<ValidationPanelProps> = ({ 
  validationResult, 
  onClose, 
  compact = false 
}) => {
  const { issues, errorCount, warningCount } = validationResult;

  if (issues.length === 0) {
    return compact ? null : (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center text-green-800">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span className="font-medium">Workflow is valid</span>
        </div>
        <p className="text-sm text-green-700 mt-1">No issues detected in the current workflow.</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-2 text-sm">
        {errorCount > 0 && (
          <div className="flex items-center text-red-600">
            <XCircle className="w-4 h-4 mr-1" />
            <span>{errorCount} error{errorCount !== 1 ? 's' : ''}</span>
          </div>
        )}
        {warningCount > 0 && (
          <div className="flex items-center text-orange-600">
            <AlertTriangle className="w-4 h-4 mr-1" />
            <span>{warningCount} warning{warningCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    );
  }

  const errors = issues.filter(issue => issue.severity === 'error');
  const warnings = issues.filter(issue => issue.severity === 'warning');

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Validation Issues</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>

      {errors.length > 0 && (
        <div className="space-y-2">
          <h4 className="flex items-center text-red-700 font-medium">
            <XCircle className="w-4 h-4 mr-2" />
            Errors ({errors.length})
          </h4>
          <div className="space-y-2">
            {errors.map(error => (
              <div key={error.id} className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-800">{error.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="space-y-2">
          <h4 className="flex items-center text-orange-700 font-medium">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Warnings ({warnings.length})
          </h4>
          <div className="space-y-2">
            {warnings.map(warning => (
              <div key={warning.id} className="bg-orange-50 border border-orange-200 rounded p-3">
                <p className="text-sm text-orange-800">{warning.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded p-3">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> Errors must be fixed before the workflow can be properly exported or executed.
          </p>
        </div>
      )}
    </div>
  );
};

export default ValidationPanel;
