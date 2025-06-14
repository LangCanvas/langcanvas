
import { useState, useCallback } from 'react';
import { NodeGroup } from '../types/groupTypes';
import { EnhancedNode } from '../types/nodeTypes';
import {
  createNodeGroup,
  updateGroupBounds,
  addNodesToGroup,
  removeNodesFromGroup,
  isNodeInGroup,
  getGroupColors
} from '../utils/nodeGrouping';

export const useNodeGrouping = (nodes: EnhancedNode[]) => {
  const [groups, setGroups] = useState<NodeGroup[]>([]);

  const createGroup = useCallback((
    name: string,
    nodeIds: string[],
    color?: string
  ) => {
    const selectedColor = color || getGroupColors()[groups.length % getGroupColors().length];
    const newGroup = createNodeGroup(name, nodeIds, nodes, selectedColor);
    setGroups(prev => [...prev, newGroup]);
    return newGroup;
  }, [nodes, groups.length]);

  const updateGroup = useCallback((groupId: string, updates: Partial<NodeGroup>) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId ? { ...group, ...updates } : group
    ));
  }, []);

  const deleteGroup = useCallback((groupId: string) => {
    setGroups(prev => prev.filter(group => group.id !== groupId));
  }, []);

  const addNodesToExistingGroup = useCallback((groupId: string, nodeIds: string[]) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId ? addNodesToGroup(group, nodeIds) : group
    ));
  }, []);

  const removeNodesFromExistingGroup = useCallback((groupId: string, nodeIds: string[]) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId ? removeNodesFromGroup(group, nodeIds) : group
    ));
  }, []);

  const updateGroupBoundsForGroup = useCallback((groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId ? updateGroupBounds(group, nodes) : group
    ));
  }, [nodes]);

  const getNodeGroup = useCallback((nodeId: string): NodeGroup | null => {
    return isNodeInGroup(nodeId, groups);
  }, [groups]);

  const toggleGroupCollapse = useCallback((groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId ? { ...group, collapsed: !group.collapsed } : group
    ));
  }, []);

  return {
    groups,
    createGroup,
    updateGroup,
    deleteGroup,
    addNodesToExistingGroup,
    removeNodesFromExistingGroup,
    updateGroupBoundsForGroup,
    getNodeGroup,
    toggleGroupCollapse,
    availableColors: getGroupColors()
  };
};
