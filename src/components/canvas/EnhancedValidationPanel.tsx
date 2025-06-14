
import React, { useState } from 'react';
import { AlertTriangle, XCircle, CheckCircle, Filter, Download, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ValidationResult, ValidationIssue } from '../../utils/graphValidation';

interface EnhancedValidationPanelProps {
  validationResult: ValidationResult;
  onQuickFix?: (issueId: string) => void;
  onExportReport?: () => void;
  compact?: boolean;
}

const EnhancedValidationPanel: React.FC<EnhancedValidationPanelProps> = ({
  validationResult,
  onQuickFix,
  onExportReport,
  compact = false
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const { issues, errorCount, warningCount } = validationResult;

  const filteredIssues = issues.filter(issue => {
    if (filterCategory !== 'all' && issue.category !== filterCategory) return false;
    if (filterSeverity !== 'all' && issue.severity !== filterSeverity) return false;
    return true;
  });

  const categories = Array.from(new Set(issues.map(issue => issue.category)));

  if (compact) {
    return (
      <div className="flex items-center space-x-2 text-sm">
        {errorCount > 0 && (
          <Badge variant="destructive" className="flex items-center">
            <XCircle className="w-3 h-3 mr-1" />
            {errorCount} error{errorCount !== 1 ? 's' : ''}
          </Badge>
        )}
        {warningCount > 0 && (
          <Badge variant="secondary" className="flex items-center border-orange-300 text-orange-700">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {warningCount} warning{warningCount !== 1 ? 's' : ''}
          </Badge>
        )}
        {issues.length === 0 && (
          <Badge variant="secondary" className="flex items-center border-green-300 text-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            Valid
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium">Validation Report</h3>
          {issues.length === 0 ? (
            <Badge variant="secondary" className="border-green-300 text-green-700">
              <CheckCircle className="w-3 h-3 mr-1" />
              All Valid
            </Badge>
          ) : (
            <Badge variant="destructive">
              {errorCount + warningCount} issue{errorCount + warningCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {onExportReport && (
            <Button variant="outline" size="sm" onClick={onExportReport}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      {issues.length > 0 && (
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="error">Errors Only</SelectItem>
              <SelectItem value="warning">Warnings Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Issues list */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {issues.length === 0 ? (
              <div className="flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500 mr-2" />
                <span>No validation issues found</span>
              </div>
            ) : (
              <span>No issues match the current filters</span>
            )}
          </div>
        ) : (
          filteredIssues.map(issue => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onQuickFix={onQuickFix}
            />
          ))
        )}
      </div>

      {/* Summary */}
      {issues.length > 0 && (
        <div className="border-t pt-4">
          <div className="text-sm text-gray-600">
            <strong>Summary:</strong> {errorCount} error{errorCount !== 1 ? 's' : ''}, {warningCount} warning{warningCount !== 1 ? 's' : ''}
            {errorCount > 0 && (
              <div className="mt-1 text-red-600">
                Errors must be resolved before the workflow can be exported or executed.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface IssueCardProps {
  issue: ValidationIssue;
  onQuickFix?: (issueId: string) => void;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, onQuickFix }) => {
  const isError = issue.severity === 'error';
  
  return (
    <div className={`p-3 rounded-lg border ${
      isError 
        ? 'bg-red-50 border-red-200' 
        : 'bg-orange-50 border-orange-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-1">
            {isError ? (
              <XCircle className="w-4 h-4 text-red-600 mr-2" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-orange-600 mr-2" />
            )}
            <Badge variant="outline" size="sm">
              {issue.category}
            </Badge>
          </div>
          <p className={`text-sm ${isError ? 'text-red-800' : 'text-orange-800'}`}>
            {issue.message}
          </p>
        </div>
        
        {onQuickFix && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onQuickFix(issue.id)}
            className="ml-2"
          >
            Quick Fix
          </Button>
        )}
      </div>
    </div>
  );
};

export default EnhancedValidationPanel;
