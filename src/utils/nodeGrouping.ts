
import { NodeGroup, GroupBounds } from '../types/groupTypes';
import { EnhancedNode } from '../types/nodeTypes';

export const calculateGroupBounds = (nodes: EnhancedNode[]): GroupBounds => {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 200, maxY: 100, width: 200, height: 100 };
  }

  const nodeWidth = 160; // Standard node width
  const nodeHeight = 60; // Standard node height
  const padding = 20;

  const minX = Math.min(...nodes.map(node => node.x)) - padding;
  const minY = Math.min(...nodes.map(node => node.y)) - padding;
  const maxX = Math.max(...nodes.map(node => node.x + nodeWidth)) + padding;
  const maxY = Math.max(...nodes.map(node => node.y + nodeHeight)) + padding;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY
  };
};

export const createNodeGroup = (
  name: string,
  nodeIds: string[],
  nodes: EnhancedNode[],
  color: string = '#e3f2fd'
): NodeGroup => {
  const groupNodes = nodes.filter(node => nodeIds.includes(node.id));
  const bounds = calculateGroupBounds(groupNodes);

  return {
    id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    description: `Group containing ${nodeIds.length} nodes`,
    color,
    nodeIds,
    collapsed: false,
    position: { x: bounds.minX, y: bounds.minY },
    size: { width: bounds.width, height: bounds.height },
    metadata: {
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      tags: []
    }
  };
};

export const updateGroupBounds = (group: NodeGroup, nodes: EnhancedNode[]): NodeGroup => {
  const groupNodes = nodes.filter(node => group.nodeIds.includes(node.id));
  const bounds = calculateGroupBounds(groupNodes);

  return {
    ...group,
    position: { x: bounds.minX, y: bounds.minY },
    size: { width: bounds.width, height: bounds.height },
    metadata: {
      ...group.metadata,
      updated: new Date().toISOString()
    }
  };
};

export const addNodesToGroup = (group: NodeGroup, nodeIds: string[]): NodeGroup => {
  const updatedNodeIds = Array.from(new Set([...group.nodeIds, ...nodeIds]));
  
  return {
    ...group,
    nodeIds: updatedNodeIds,
    description: `Group containing ${updatedNodeIds.length} nodes`,
    metadata: {
      ...group.metadata,
      updated: new Date().toISOString()
    }
  };
};

export const removeNodesFromGroup = (group: NodeGroup, nodeIds: string[]): NodeGroup => {
  const updatedNodeIds = group.nodeIds.filter(id => !nodeIds.includes(id));
  
  return {
    ...group,
    nodeIds: updatedNodeIds,
    description: `Group containing ${updatedNodeIds.length} nodes`,
    metadata: {
      ...group.metadata,
      updated: new Date().toISOString()
    }
  };
};

export const isNodeInGroup = (nodeId: string, groups: NodeGroup[]): NodeGroup | null => {
  return groups.find(group => group.nodeIds.includes(nodeId)) || null;
};

export const getGroupColors = (): string[] => {
  return [
    '#e3f2fd', // Blue
    '#f3e5f5', // Purple
    '#e8f5e8', // Green
    '#fff3e0', // Orange
    '#fce4ec', // Pink
    '#e0f2f1', // Teal
    '#f9fbe7', // Lime
    '#fff8e1', // Amber
    '#efebe9', // Brown
    '#eceff1'  // Blue Grey
  ];
};
