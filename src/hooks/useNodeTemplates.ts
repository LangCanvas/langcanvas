
import { useState, useCallback } from 'react';
import { EnhancedNode, NodeType } from '../types/nodeTypes';
import { 
  nodeTemplates, 
  NodeTemplate, 
  createNodeFromTemplate,
  getTemplatesByCategory,
  getTemplatesByNodeType,
  searchTemplates
} from '../utils/nodeTemplates';

export const useNodeTemplates = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getFilteredTemplates = useCallback((): NodeTemplate[] => {
    let filtered = nodeTemplates;

    if (searchQuery.trim()) {
      filtered = searchTemplates(searchQuery);
    } else if (selectedCategory) {
      filtered = getTemplatesByCategory(selectedCategory);
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  const createNodeFromTemplateId = useCallback((
    templateId: string,
    x: number,
    y: number
  ): EnhancedNode | null => {
    return createNodeFromTemplate(templateId, x, y);
  }, []);

  const getTemplatesForNodeType = useCallback((nodeType: NodeType): NodeTemplate[] => {
    return getTemplatesByNodeType(nodeType);
  }, []);

  return {
    templates: nodeTemplates,
    filteredTemplates: getFilteredTemplates(),
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    createNodeFromTemplateId,
    getTemplatesForNodeType,
    clearFilters: () => {
      setSelectedCategory(null);
      setSearchQuery('');
    }
  };
};
