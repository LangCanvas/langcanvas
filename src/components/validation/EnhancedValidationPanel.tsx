
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Info, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import { ValidationResult, ValidationIssue } from '../../utils/enhancedWorkflowValidation';

interface EnhancedValidationPanelProps {
  validationResult: ValidationResult;
  onFixIssue?: (issueId: string) => void;
  onSelectNode?: (nodeId: string) => void;
  onSelectEdge?: (edgeId: string) => void;
  compact?: boolean;
}

const EnhancedValidationPanel: React.FC<EnhancedValidationPanelProps> = ({
  validationResult,
  onFixIssue,
  onSelectNode,
  onSelectEdge,
  compact = false
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const getFilteredIssues = (): ValidationIssue[] => {
    if (selectedSeverity === 'all') return validationResult.issues;
    return validationResult.issues.filter(issue => issue.severity === selectedSeverity);
  };

  const getSeverityIcon = (severity: ValidationIssue['severity']) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getSeverityColor = (severity: ValidationIssue['severity']) => {
    switch (severity) {
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleIssueClick = (issue: ValidationIssue) => {
    if (issue.nodeId && onSelectNode) {
      onSelectNode(issue.nodeId);
    } else if (issue.edgeId && onSelectEdge) {
      onSelectEdge(issue.edgeId);
    }
  };

  if (compact) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Validation Status</h3>
          {validationResult.valid ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="text-center">
            <div className="text-red-600 font-medium">{validationResult.errorCount}</div>
            <div className="text-gray-500">Errors</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-600 font-medium">{validationResult.warningCount}</div>
            <div className="text-gray-500">Warnings</div>
          </div>
          <div className="text-center">
            <div className="text-blue-600 font-medium">{validationResult.infoCount}</div>
            <div className="text-gray-500">Info</div>
          </div>
        </div>

        {validationResult.issues.length > 0 && (
          <div className="space-y-2">
            {validationResult.issues.slice(0, 3).map((issue) => (
              <div
                key={issue.id}
                className="flex items-start space-x-2 p-2 bg-gray-50 rounded text-xs cursor-pointer hover:bg-gray-100"
                onClick={() => handleIssueClick(issue)}
              >
                {getSeverityIcon(issue.severity)}
                <span className="flex-1 truncate">{issue.message}</span>
              </div>
            ))}
            {validationResult.issues.length > 3 && (
              <div className="text-xs text-gray-500 text-center">
                +{validationResult.issues.length - 3} more issues
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Workflow Validation</h3>
          {validationResult.valid ? (
            <Badge className="bg-green-100 text-green-800">Valid</Badge>
          ) : (
            <Badge className="bg-red-100 text-red-800">Issues Found</Badge>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-red-50 rounded">
            <div className="text-red-600 font-bold text-lg">{validationResult.errorCount}</div>
            <div className="text-red-700">Errors</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded">
            <div className="text-yellow-600 font-bold text-lg">{validationResult.warningCount}</div>
            <div className="text-yellow-700">Warnings</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded">
            <div className="text-blue-600 font-bold text-lg">{validationResult.infoCount}</div>
            <div className="text-blue-700">Info</div>
          </div>
        </div>
      </div>

      <Tabs value={selectedSeverity} onValueChange={setSelectedSeverity} className="flex-1 flex flex-col">
        <div className="px-4 pt-2">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="error">Errors</TabsTrigger>
            <TabsTrigger value="warning">Warnings</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={selectedSeverity} className="flex-1 mt-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {getFilteredIssues().map((issue) => (
                <div
                  key={issue.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:shadow-sm transition-shadow ${getSeverityColor(issue.severity)}`}
                  onClick={() => handleIssueClick(issue)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2 flex-1">
                      {getSeverityIcon(issue.severity)}
                      <div className="flex-1">
                        <div className="font-medium text-sm">{issue.message}</div>
                        {issue.description && (
                          <div className="text-xs opacity-75 mt-1">{issue.description}</div>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {issue.category}
                          </Badge>
                          {issue.nodeId && (
                            <Badge variant="outline" className="text-xs">
                              Node
                            </Badge>
                          )}
                          {issue.edgeId && (
                            <Badge variant="outline" className="text-xs">
                              Edge
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {issue.autoFixable && onFixIssue && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFixIssue(issue.id);
                        }}
                        className="ml-2"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Fix
                      </Button>
                    )}
                  </div>
                  {issue.suggestedFix && (
                    <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                      <span className="font-medium">Suggestion: </span>
                      {issue.suggestedFix}
                    </div>
                  )}
                </div>
              ))}

              {getFilteredIssues().length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <div className="font-medium">No {selectedSeverity !== 'all' ? selectedSeverity + 's' : 'issues'} found</div>
                  <div className="text-sm">Your workflow looks good!</div>
                </div>
              )}
            </div>

            {validationResult.suggestions.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Optimization Suggestions</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  {validationResult.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedValidationPanel;
