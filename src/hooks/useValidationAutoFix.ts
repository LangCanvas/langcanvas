import { useCallback } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { EnhancedEdge } from '../types/edgeTypes';
import { ValidationIssue } from '../utils/graphValidation';
import { toast } from 'sonner';

interface UseValidationAutoFixProps {
  nodes: EnhancedNode[];
  edges: EnhancedEdge[];
  onUpdateNode: (nodeId: string, updates: Partial<EnhancedNode>) => void;
  onDeleteEdge: (edgeId: string) => void;
  onAddNode: (node: Partial<EnhancedNode>) => void;
}

export const useValidationAutoFix = ({
  nodes,
  edges,
  onUpdateNode,
  onDeleteEdge,
  onAddNode
}: UseValidationAutoFixProps) => {
  
  const autoFixIssue = useCallback((issue: ValidationIssue) => {
    console.log('🔧 Attempting auto-fix for issue:', issue);

    switch (issue.category) {
      case 'structure':
        handleStructuralFix(issue);
        break;
      case 'data':
        handleDataFix(issue);
        break;
      case 'conditional':
        handleConditionalFix(issue);
        break;
      default:
        toast.error('Auto-fix not available', {
          description: 'This type of issue requires manual resolution.'
        });
    }
  }, [nodes, edges, onUpdateNode, onDeleteEdge, onAddNode]);

  const handleStructuralFix = (issue: ValidationIssue) => {
    if (issue.message.includes('Multiple Start nodes')) {
      // Keep the first start node, convert others to regular nodes
      const startNodes = nodes.filter(node => node.type === 'start');
      if (startNodes.length > 1) {
        for (let i = 1; i < startNodes.length; i++) {
          onUpdateNode(startNodes[i].id, { type: 'agent' });
        }
        toast.success('Fixed multiple start nodes', {
          description: 'Converted extra start nodes to agent nodes.'
        });
      }
    } else if (issue.message.includes('No Start node')) {
      // Convert the first node to a start node if no start exists
      if (nodes.length > 0) {
        onUpdateNode(nodes[0].id, { type: 'start' });
        toast.success('Added start node', {
          description: 'Converted the first node to a start node.'
        });
      }
    } else if (issue.message.includes('Tool node') && issue.message.includes('multiple outputs')) {
      // Remove extra edges from tool nodes
      if (issue.nodeIds && issue.nodeIds.length > 0) {
        const toolNodeId = issue.nodeIds[0];
        const toolEdges = edges.filter(edge => edge.source === toolNodeId);
        
        // Keep only the first edge, remove the rest
        for (let i = 1; i < toolEdges.length; i++) {
          onDeleteEdge(toolEdges[i].id);
        }
        
        toast.success('Fixed tool node outputs', {
          description: 'Removed extra output connections from tool node.'
        });
      }
    }
  };

  const handleDataFix = (issue: ValidationIssue) => {
    if (issue.message.includes('duplicate') && issue.message.includes('label')) {
      // Auto-fix duplicate labels by adding numbers
      if (issue.nodeIds) {
        issue.nodeIds.forEach((nodeId, index) => {
          if (index > 0) { // Keep the first one unchanged
            const node = nodes.find(n => n.id === nodeId);
            if (node) {
              const newLabel = `${node.label} (${index + 1})`;
              onUpdateNode(nodeId, { label: newLabel });
            }
          }
        });
        
        toast.success('Fixed duplicate labels', {
          description: 'Added numbers to distinguish duplicate labels.'
        });
      }
    }
  };

  const handleConditionalFix = (issue: ValidationIssue) => {
    if (issue.message.includes('duplicate priorities')) {
      // Re-number priorities for conditional edges
      if (issue.nodeIds && issue.nodeIds.length > 0) {
        const conditionalNodeId = issue.nodeIds[0];
        const conditionalEdges = edges.filter(edge => 
          edge.source === conditionalNodeId && edge.conditional
        );
        
        // This would require edge update functionality
        toast.info('Manual fix required', {
          description: 'Please manually update the priority values for conditional edges.'
        });
      }
    }
  };

  const canAutoFix = useCallback((issue: ValidationIssue): boolean => {
    const autoFixableMessages = [
      'Multiple Start nodes',
      'No Start node',
      'Tool node',
      'duplicate',
      'label'
    ];
    
    return autoFixableMessages.some(pattern => issue.message.includes(pattern));
  }, []);

  return {
    autoFixIssue,
    canAutoFix
  };
};
