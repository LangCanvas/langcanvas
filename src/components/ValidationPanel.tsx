
import React from 'react';
import { ValidationResult } from '../utils/graphValidation';
import EnhancedValidationPanel from './canvas/EnhancedValidationPanel';
import { useValidationAutoFix } from '../hooks/useValidationAutoFix';

interface ValidationPanelProps {
  validationResult: ValidationResult;
  onClose?: () => void;
  compact?: boolean;
  nodes?: any[];
  edges?: any[];
  onUpdateNode?: (nodeId: string, updates: any) => void;
  onDeleteEdge?: (edgeId: string) => void;
  onAddNode?: (node: any) => void;
}

const ValidationPanel: React.FC<ValidationPanelProps> = ({ 
  validationResult, 
  onClose, 
  compact = false,
  nodes = [],
  edges = [],
  onUpdateNode,
  onDeleteEdge,
  onAddNode
}) => {
  const { autoFixIssue, canAutoFix } = useValidationAutoFix({
    nodes,
    edges,
    onUpdateNode: onUpdateNode || (() => {}),
    onDeleteEdge: onDeleteEdge || (() => {}),
    onAddNode: onAddNode || (() => {})
  });

  const handleQuickFix = (issueId: string) => {
    const issue = validationResult.issues.find(i => i.id === issueId);
    if (issue && canAutoFix(issue)) {
      autoFixIssue(issue);
    }
  };

  const handleExportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalIssues: validationResult.issues.length,
        errors: validationResult.errorCount,
        warnings: validationResult.warningCount,
        isValid: validationResult.isValid
      },
      issues: validationResult.issues.map(issue => ({
        id: issue.id,
        severity: issue.severity,
        category: issue.category,
        message: issue.message,
        nodeIds: issue.nodeIds,
        edgeIds: issue.edgeIds
      }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validation-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <EnhancedValidationPanel
      validationResult={validationResult}
      onQuickFix={onUpdateNode ? handleQuickFix : undefined}
      onExportReport={handleExportReport}
      compact={compact}
    />
  );
};

export default ValidationPanel;
