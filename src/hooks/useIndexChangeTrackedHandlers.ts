
import React from 'react';
import { NodeType, EnhancedNode } from '../types/nodeTypes';
import { EnhancedEdge } from '../types/edgeTypes';
import { useIndexState } from './useIndexState'; // For types
import { useChangeTracking } from './useChangeTracking'; // For types
import { useWorkflowActions } from './useWorkflowActions'; // For types
import { useIndexHandlers } from './useIndexHandlers'; // For types

type NodeCreationType = ReturnType<typeof useIndexState>['nodeCreation'];
type NodeStateType = ReturnType<typeof useIndexState>['nodeState'];
type EdgeStateType = ReturnType<typeof useIndexState>['edgeState'];
type IndexHandlersType = ReturnType<typeof useIndexHandlers>;
type WorkflowActionsType = ReturnType<typeof useWorkflowActions>; // Corrected: useWorkflowActions is not part of useIndexState
type ChangeTrackingType = ReturnType<typeof useChangeTracking>;


interface UseIndexChangeTrackedHandlersProps {
  nodeCreation: NodeCreationType;
  nodeState: NodeStateType;
  edgeState: EdgeStateType;
  indexHandlers: IndexHandlersType;
  workflowActions: WorkflowActionsType;
  changeTracking: ChangeTrackingType;
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
    edgeState.deleteEdge(id); // Original used edgeState.deleteEdge directly
    markAsChanged();
  }, [edgeState, markAsChanged]);

  const handleUpdateNodePropertiesWithTracking = React.useCallback((id: string, updates: Partial<EnhancedNode>) => {
    indexHandlers.handleUpdateNodeProperties(id, updates);
    markAsChanged();
  }, [indexHandlers, markAsChanged]);

  const _handleUpdateEdgePropertiesWithTrackingInternal = React.useCallback((id: string, updates: Partial<EnhancedEdge>) => {
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

  // Special handler that uses an internal tracked handler
  const handleUpdateEdgeWithCondition = React.useCallback((edgeId: string, updates: Partial<EnhancedEdge>) => {
    _handleUpdateEdgePropertiesWithTrackingInternal(edgeId, updates);
    if (updates.conditional) {
      edgeState.updateEdgeCondition(edgeId, updates.conditional.condition);
      // markAsChanged() is already called by _handleUpdateEdgePropertiesWithTrackingInternal
    }
  }, [_handleUpdateEdgePropertiesWithTrackingInternal, edgeState]);


  return {
    handleAddNodeWithTracking,
    handleDeleteNodeWithTracking,
    handleDeleteEdgeWithTracking,
    handleUpdateNodePropertiesWithTracking,
    handleUpdateEdgePropertiesWithTracking: _handleUpdateEdgePropertiesWithTrackingInternal, // Expose the internal one as the main one now
    handleAddEdgeWithTracking,
    handleMoveNodeWithTracking,
    handleExportWithTracking,
    handleNewProjectWithTracking,
    handleImportWithTracking,
    handleUpdateEdgeWithCondition,
  };
};
