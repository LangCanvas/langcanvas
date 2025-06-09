import { useState, useCallback, useEffect } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { Edge } from './useEdges';
import { validateGraph, ValidationResult, ValidationIssue } from '../utils/graphValidation';

interface UseValidationProps {
  nodes: EnhancedNode[];
  edges: Edge[];
}

// Re-export ValidationResult so other components can use it
export type { ValidationResult, ValidationIssue } from '../utils/graphValidation';

export const useValidation = ({ nodes, edges }: UseValidationProps) => {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    issues: [],
    errorCount: 0,
    warningCount: 0
  });

  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  const [highlightedEdges, setHighlightedEdges] = useState<Set<string>>(new Set());
  const [nodeIssues, setNodeIssues] = useState<Map<string, ValidationIssue[]>>(new Map());
  const [edgeIssues, setEdgeIssues] = useState<Map<string, ValidationIssue[]>>(new Map());

  const runValidation = useCallback(() => {
    console.log('🔍 Running validation on', nodes.length, 'nodes and', edges.length, 'edges');
    
    const result = validateGraph(nodes, edges);
    setValidationResult(result);

    // Build highlight sets and issue maps
    const newHighlightedNodes = new Set<string>();
    const newHighlightedEdges = new Set<string>();
    const newNodeIssues = new Map<string, ValidationIssue[]>();
    const newEdgeIssues = new Map<string, ValidationIssue[]>();

    result.issues.forEach(issue => {
      // Add nodes to highlight
      issue.nodeIds?.forEach(nodeId => {
        newHighlightedNodes.add(nodeId);
        if (!newNodeIssues.has(nodeId)) {
          newNodeIssues.set(nodeId, []);
        }
        newNodeIssues.get(nodeId)!.push(issue);
      });

      // Add edges to highlight
      issue.edgeIds?.forEach(edgeId => {
        newHighlightedEdges.add(edgeId);
        if (!newEdgeIssues.has(edgeId)) {
          newEdgeIssues.set(edgeId, []);
        }
        newEdgeIssues.get(edgeId)!.push(issue);
      });
    });

    setHighlightedNodes(newHighlightedNodes);
    setHighlightedEdges(newHighlightedEdges);
    setNodeIssues(newNodeIssues);
    setEdgeIssues(newEdgeIssues);

    console.log('🔍 Validation result:', result);
    return result;
  }, [nodes, edges]);

  // Run validation whenever nodes or edges change
  useEffect(() => {
    runValidation();
  }, [runValidation]);

  const getNodeTooltip = useCallback((nodeId: string): string => {
    const issues = nodeIssues.get(nodeId);
    if (!issues || issues.length === 0) return '';
    
    return issues.map(issue => issue.message).join('; ');
  }, [nodeIssues]);

  const getEdgeTooltip = useCallback((edgeId: string): string => {
    const issues = edgeIssues.get(edgeId);
    if (!issues || issues.length === 0) return '';
    
    return issues.map(issue => issue.message).join('; ');
  }, [edgeIssues]);

  const getNodeErrorClass = useCallback((nodeId: string): string => {
    const issues = nodeIssues.get(nodeId);
    if (!issues || issues.length === 0) return '';
    
    const hasError = issues.some(issue => issue.severity === 'error');
    return hasError ? 'validation-error' : 'validation-warning';
  }, [nodeIssues]);

  const getEdgeErrorClass = useCallback((edgeId: string): string => {
    const issues = edgeIssues.get(edgeId);
    if (!issues || issues.length === 0) return '';
    
    const hasError = issues.some(issue => issue.severity === 'error');
    return hasError ? 'validation-error' : 'validation-warning';
  }, [edgeIssues]);

  return {
    validationResult,
    highlightedNodes,
    highlightedEdges,
    nodeIssues,
    edgeIssues,
    runValidation,
    getNodeTooltip,
    getEdgeTooltip,
    getNodeErrorClass,
    getEdgeErrorClass
  };
};
