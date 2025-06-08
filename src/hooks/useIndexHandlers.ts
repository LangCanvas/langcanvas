
import { useEnhancedAnalytics } from './useEnhancedAnalytics';
import { EnhancedNode } from '../types/nodeTypes';
import { Edge } from './useEdges';

interface UseIndexHandlersProps {
  nodes: EnhancedNode[];
  deleteEdgesForNode: (nodeId: string) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  addEdge: (sourceNode: EnhancedNode, targetNode: EnhancedNode) => { success: boolean; error?: string };
  selectNode: (nodeId: string | null) => void;
  selectEdge: (edgeId: string | null) => void;
  updateNodeProperties: (nodeId: string, properties: any) => void;
  updateEdgeProperties: (edgeId: string, properties: any) => void;
}

export const useIndexHandlers = ({
  nodes,
  deleteEdgesForNode,
  deleteNode,
  deleteEdge,
  addEdge,
  selectNode,
  selectEdge,
  updateNodeProperties,
  updateEdgeProperties,
}: UseIndexHandlersProps) => {
  const analytics = useEnhancedAnalytics();

  const handleDeleteNode = (nodeId: string) => {
    deleteEdgesForNode(nodeId);
    deleteNode(nodeId);
    
    // Track node deletion
    analytics.trackFeatureUsage('node_deleted', { nodeId });
  };

  const handleAddEdge = (sourceNode: EnhancedNode, targetNode: EnhancedNode) => {
    const result = addEdge(sourceNode, targetNode);
    
    // Track edge creation
    if (result.success) {
      analytics.trackEdgeCreated(sourceNode.type, targetNode.type);
    }
    
    return result;
  };

  const handleSelectNode = (nodeId: string | null) => {
    selectNode(nodeId);
    
    // Track node selection
    if (nodeId && analytics.isEnabled) {
      const node = nodes.find(n => n.id === nodeId);
      analytics.trackFeatureUsage('node_selected', { 
        nodeId, 
        nodeType: node?.type 
      });
    }
  };

  const handleSelectEdge = (edgeId: string | null) => {
    selectEdge(edgeId);
    
    // Track edge selection
    if (edgeId && analytics.isEnabled) {
      analytics.trackFeatureUsage('edge_selected', { edgeId });
    }
  };

  const handleUpdateNodeProperties = (nodeId: string, properties: any) => {
    updateNodeProperties(nodeId, properties);
    
    // Track property changes
    analytics.trackFeatureUsage('node_properties_updated', { 
      nodeId, 
      properties: Object.keys(properties) 
    });
  };

  const handleUpdateEdgeProperties = (edgeId: string, properties: any) => {
    updateEdgeProperties(edgeId, properties);
    
    // Track edge property changes
    analytics.trackFeatureUsage('edge_properties_updated', { 
      edgeId, 
      properties: Object.keys(properties) 
    });
  };

  return {
    handleDeleteNode,
    handleAddEdge,
    handleSelectNode,
    handleSelectEdge,
    handleUpdateNodeProperties,
    handleUpdateEdgeProperties,
  };
};
