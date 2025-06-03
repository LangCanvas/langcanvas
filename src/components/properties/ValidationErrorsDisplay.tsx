
import React from 'react';

interface ValidationErrorsDisplayProps {
  errors: string[];
}

const ValidationErrorsDisplay: React.FC<ValidationErrorsDisplayProps> = ({ errors }) => {
  if (errors.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
      <h4 className="text-sm font-medium text-red-800 mb-2">Configuration Errors:</h4>
      <ul className="text-sm text-red-700 space-y-1">
        {errors.map((error, index) => (
          <li key={index}>• {error}</li>
        ))}
      </ul>
    </div>
  );
};

export default ValidationErrorsDisplay;
