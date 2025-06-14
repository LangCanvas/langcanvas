
import { useState, useEffect, useCallback } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { EnhancedEdge } from '../types/edgeTypes';
import { NodeGroup } from '../types/groupTypes';
import { validateWorkflowStructure, ValidationResult, ValidationIssue } from '../utils/enhancedWorkflowValidation';

interface UseEnhancedValidationProps {
  nodes: EnhancedNode[];
  edges: EnhancedEdge[];
  groups?: NodeGroup[];
}

export const useEnhancedValidation = ({ nodes, edges, groups = [] }: UseEnhancedValidationProps) => {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    valid: true,
    issues: [],
    errorCount: 0,
    warningCount: 0,
    infoCount: 0,
    suggestions: []
  });

  const [autoFixInProgress, setAutoFixInProgress] = useState(false);

  const runValidation = useCallback(() => {
    const result = validateWorkflowStructure(nodes, edges, groups);
    setValidationResult(result);
    return result;
  }, [nodes, edges, groups]);

  // Auto-run validation when nodes or edges change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      runValidation();
    }, 500); // Debounce validation

    return () => clearTimeout(timeoutId);
  }, [runValidation]);

  const getNodeErrorClass = useCallback((nodeId: string): string => {
    const nodeIssues = validationResult.issues.filter(issue => issue.nodeId === nodeId);
    
    if (nodeIssues.some(issue => issue.severity === 'error')) {
      return 'border-red-500 bg-red-50';
    }
    if (nodeIssues.some(issue => issue.severity === 'warning')) {
      return 'border-yellow-500 bg-yellow-50';
    }
    if (nodeIssues.some(issue => issue.severity === 'info')) {
      return 'border-blue-500 bg-blue-50';
    }
    
    return '';
  }, [validationResult.issues]);

  const getEdgeErrorClass = useCallback((edgeId: string): string => {
    const edgeIssues = validationResult.issues.filter(issue => issue.edgeId === edgeId);
    
    if (edgeIssues.some(issue => issue.severity === 'error')) {
      return 'stroke-red-500';
    }
    if (edgeIssues.some(issue => issue.severity === 'warning')) {
      return 'stroke-yellow-500';
    }
    if (edgeIssues.some(issue => issue.severity === 'info')) {
      return 'stroke-blue-500';
    }
    
    return '';
  }, [validationResult.issues]);

  const getNodeTooltip = useCallback((nodeId: string): string => {
    const nodeIssues = validationResult.issues.filter(issue => issue.nodeId === nodeId);
    
    if (nodeIssues.length === 0) return '';
    
    const errorCount = nodeIssues.filter(issue => issue.severity === 'error').length;
    const warningCount = nodeIssues.filter(issue => issue.severity === 'warning').length;
    
    const parts = [];
    if (errorCount > 0) parts.push(`${errorCount} error${errorCount !== 1 ? 's' : ''}`);
    if (warningCount > 0) parts.push(`${warningCount} warning${warningCount !== 1 ? 's' : ''}`);
    
    return parts.join(', ');
  }, [validationResult.issues]);

  const getEdgeTooltip = useCallback((edgeId: string): string => {
    const edgeIssues = validationResult.issues.filter(issue => issue.edgeId === edgeId);
    
    if (edgeIssues.length === 0) return '';
    
    return edgeIssues.map(issue => issue.message).join('\n');
  }, [validationResult.issues]);

  const fixIssue = useCallback(async (issueId: string): Promise<boolean> => {
    setAutoFixInProgress(true);
    
    try {
      const issue = validationResult.issues.find(i => i.id === issueId);
      
      if (!issue || !issue.autoFixable) {
        return false;
      }

      // Implement auto-fix logic based on issue type
      switch (issue.id.split('-')[0]) {
        case 'missing':
          // Handle missing nodes
          break;
        case 'multiple':
          // Handle multiple nodes of same type
          break;
        case 'empty':
          // Handle empty labels/configurations
          break;
        default:
          console.warn('Auto-fix not implemented for issue:', issue.id);
          return false;
      }

      // Re-run validation after fix
      setTimeout(() => {
        runValidation();
      }, 100);

      return true;
    } catch (error) {
      console.error('Error fixing issue:', error);
      return false;
    } finally {
      setAutoFixInProgress(false);
    }
  }, [validationResult.issues, runValidation]);

  const getIssuesByNode = useCallback((nodeId: string): ValidationIssue[] => {
    return validationResult.issues.filter(issue => issue.nodeId === nodeId);
  }, [validationResult.issues]);

  const getIssuesByEdge = useCallback((edgeId: string): ValidationIssue[] => {
    return validationResult.issues.filter(issue => issue.edgeId === edgeId);
  }, [validationResult.issues]);

  return {
    validationResult,
    runValidation,
    autoFixInProgress,
    fixIssue,
    getNodeErrorClass,
    getEdgeErrorClass,
    getNodeTooltip,
    getEdgeTooltip,
    getIssuesByNode,
    getIssuesByEdge
  };
};
