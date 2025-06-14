
import React from 'react';
import { NodeType, EnhancedNode } from '../types/nodeTypes';
import { EnhancedEdge } from '../types/edgeTypes';

interface UseIndexChangeTrackedHandlersProps {
  nodeCreation: any;
  nodeState: any;
  edgeState: any;
  indexHandlers: any;
  workflowActions: any;
  changeTracking: any;
}

export const useIndexChangeTrackedHandlers = ({
  nodeCreation,
  nodeState,
  edgeState,
  indexHandlers,
  workflowActions,
  changeTracking,
}: UseIndexChangeTrackedHandlersProps) => {
  const { markAsChanged, markAsSaved } = changeTracking;

  const handleAddNodeWithTracking = React.useCallback((type: NodeType, x: number, y: number) => {
    const result = nodeCreation.createNode(type, x, y);
    if (result) {
      markAsChanged();
    }
    return result;
  }, [nodeCreation, markAsChanged]);

  const handleDeleteNodeWithTracking = React.useCallback((id: string) => {
    indexHandlers.handleDeleteNode(id);
    markAsChanged();
  }, [indexHandlers, markAsChanged]);

  const handleDeleteEdgeWithTracking = React.useCallback((id: string) => {
    edgeState.deleteEdge(id);
    markAsChanged();
  }, [edgeState, markAsChanged]);

  const handleUpdateNodePropertiesWithTracking = React.useCallback((id: string, updates: Partial<EnhancedNode>) => {
    indexHandlers.handleUpdateNodeProperties(id, updates);
    markAsChanged();
  }, [indexHandlers, markAsChanged]);

  const handleUpdateEdgePropertiesWithTracking = React.useCallback((id: string, updates: Partial<EnhancedEdge>) => {
    indexHandlers.handleUpdateEdgeProperties(id, updates);
    markAsChanged();
  }, [indexHandlers, markAsChanged]);

  const handleAddEdgeWithTracking = React.useCallback((sourceNode: EnhancedNode, targetNode: EnhancedNode) => {
    const result = indexHandlers.handleAddEdge(sourceNode, targetNode);
    if (result.success) {
      markAsChanged();
    }
    return result;
  }, [indexHandlers, markAsChanged]);

  const handleMoveNodeWithTracking = React.useCallback((id: string, x: number, y: number) => {
    nodeState.updateNodePosition(id, x, y);
    markAsChanged();
  }, [nodeState, markAsChanged]);

  // Workflow action wrappers
  const handleExportWithTracking = React.useCallback(() => {
    workflowActions.handleExport();
    markAsSaved();
  }, [workflowActions, markAsSaved]);

  const handleNewProjectWithTracking = React.useCallback(() => {
    workflowActions.handleNewProject();
    markAsSaved();
  }, [workflowActions, markAsSaved]);

  const handleImportWithTracking = React.useCallback(() => {
    workflowActions.handleImport();
    markAsSaved();
  }, [workflowActions, markAsSaved]);

  const handleUpdateEdgeWithCondition = React.useCallback((edgeId: string, updates: Partial<EnhancedEdge>) => {
    handleUpdateEdgePropertiesWithTracking(edgeId, updates);
    if (updates.conditional) {
      edgeState.updateEdgeCondition(edgeId, updates.conditional.condition);
    }
  }, [handleUpdateEdgePropertiesWithTracking, edgeState]);

  return {
    handleAddNodeWithTracking,
    handleDeleteNodeWithTracking,
    handleDeleteEdgeWithTracking,
    handleUpdateNodePropertiesWithTracking,
    handleUpdateEdgePropertiesWithTracking,
    handleAddEdgeWithTracking,
    handleMoveNodeWithTracking,
    handleExportWithTracking,
    handleNewProjectWithTracking,
    handleImportWithTracking,
    handleUpdateEdgeWithCondition,
  };
};
