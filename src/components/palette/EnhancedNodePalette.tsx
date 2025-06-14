import React, { useState, useMemo } from 'react';
import { PanelLeftClose } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NodeType } from '../../types/nodeTypes';
import { getAllNodes, getNodesByCategory, searchNodes, NodeDefinition } from '../../utils/nodeCategories';
import { useEnhancedAnalytics } from '../../hooks/useEnhancedAnalytics';
import { PanelLayout } from '../../hooks/useAdaptivePanelWidths';
import NodePaletteSearch from './NodePaletteSearch';
import NodeCategorySelector from './NodeCategorySelector';
import EnhancedNodeItem from './EnhancedNodeItem';

interface EnhancedNodePaletteProps {
  onNodeTypeSelect?: (type: NodeType) => void;
  onToggle?: () => void;
  isExpanded?: boolean;
  panelWidth?: number;
  panelLayout?: PanelLayout;
}

const EnhancedNodePalette: React.FC<EnhancedNodePaletteProps> = ({ 
  onNodeTypeSelect, 
  onToggle, 
  isExpanded = true,
  panelWidth = 256,
  panelLayout = 'standard'
}) => {
  const analytics = useEnhancedAnalytics();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredNodes = useMemo((): NodeDefinition[] => {
    if (searchQuery.trim()) {
      return searchNodes(searchQuery);
    }
    
    if (selectedCategory) {
      return getNodesByCategory(selectedCategory);
    }
    
    return getAllNodes();
  }, [searchQuery, selectedCategory]);

  const handleDragStart = (e: React.DragEvent, nodeType: NodeType, label: string) => {
    analytics.trackFeatureUsage('node_palette_drag_start', { 
      nodeType, 
      method: 'drag_and_drop',
      category: selectedCategory || 'all',
      searchQuery: searchQuery || undefined,
      panelWidth,
      panelLayout
    });
  };

  const handleClick = (e: React.MouseEvent, nodeType: NodeType) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log(`🎯 Enhanced node palette clicked: ${nodeType}`);
    
    analytics.trackFeatureUsage('node_palette_click', { 
      nodeType, 
      method: 'click_to_select',
      category: selectedCategory || 'all',
      searchQuery: searchQuery || undefined,
      panelWidth,
      panelLayout
    });
    
    if (onNodeTypeSelect) {
      onNodeTypeSelect(nodeType);
    } else {
      const canvas = document.getElementById('canvas');
      if (canvas) {
        canvas.setAttribute('data-node-type', nodeType);
        
        const instruction = document.createElement('div');
        instruction.className = 'fixed top-4 left-4 right-4 bg-blue-100 border border-blue-300 rounded-lg p-3 text-blue-800 text-sm z-50 lg:hidden';
        instruction.textContent = `Tap on the canvas to place the ${nodeType} node`;
        document.body.appendChild(instruction);
        
        setTimeout(() => {
          if (document.body.contains(instruction)) {
            document.body.removeChild(instruction);
          }
        }, 3000);
      }
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  // Layout configuration based on panel size - updated to be content-aware
  const layoutConfig = useMemo(() => {
    switch (panelLayout) {
      case 'ultra-compact':
        return {
          showSearch: false,
          showCategories: true, // Show categories but compact
          showDescriptions: false,
          showNodeCount: false,
          compactItems: true,
          compactCategories: true,
          maxVisibleNodes: 8
        };
      case 'compact':
        return {
          showSearch: true,
          showCategories: true,
          showDescriptions: false,
          showNodeCount: false,
          compactItems: true,
          compactCategories: false,
          maxVisibleNodes: 12
        };
      case 'standard':
        return {
          showSearch: true,
          showCategories: true,
          showDescriptions: false,
          showNodeCount: true,
          compactItems: false,
          compactCategories: false,
          maxVisibleNodes: null
        };
      case 'wide':
        return {
          showSearch: true,
          showCategories: true,
          showDescriptions: true,
          showNodeCount: true,
          compactItems: false,
          compactCategories: false,
          maxVisibleNodes: null
        };
      default:
        return {
          showSearch: true,
          showCategories: true,
          showDescriptions: true,
          showNodeCount: true,
          compactItems: false,
          compactCategories: false,
          maxVisibleNodes: null
        };
    }
  }, [panelLayout]);

  const displayNodes = layoutConfig.maxVisibleNodes 
    ? filteredNodes.slice(0, layoutConfig.maxVisibleNodes)
    : filteredNodes;

  const paddingClass = panelLayout === 'ultra-compact' ? 'p-2' : panelLayout === 'compact' ? 'p-3' : 'p-4';

  return (
    <div className={`${paddingClass} h-full flex flex-col`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`font-medium text-gray-700 ${panelLayout === 'ultra-compact' ? 'text-xs' : 'text-sm'}`}>
          {panelLayout === 'ultra-compact' ? 'Nodes' : 'Node Palette'}
        </h2>
        {onToggle && panelLayout !== 'ultra-compact' && (
          <button
            onClick={onToggle}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            title="Collapse Node Palette"
          >
            <PanelLeftClose className="w-4 h-4 text-gray-700" />
          </button>
        )}
      </div>

      <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
        {layoutConfig.showSearch && (
          <NodePaletteSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            placeholder={panelLayout === 'compact' ? 'Search...' : 'Search nodes...'}
          />
        )}

        {layoutConfig.showCategories && !searchQuery && (
          <NodeCategorySelector
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            compact={layoutConfig.compactCategories}
          />
        )}

        <ScrollArea className="flex-1">
          <div className={`space-y-3 pr-3 ${layoutConfig.compactItems ? 'space-y-1' : ''}`}>
            {displayNodes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No nodes found</p>
                {(searchQuery || selectedCategory) && (
                  <button
                    onClick={handleClearSearch}
                    className="text-xs text-blue-600 hover:text-blue-800 mt-2"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              displayNodes.map((node) => (
                <EnhancedNodeItem
                  key={node.type}
                  node={node}
                  onDragStart={handleDragStart}
                  onClick={handleClick}
                  showDescription={layoutConfig.showDescriptions}
                  compact={layoutConfig.compactItems}
                  panelLayout={panelLayout}
                />
              ))
            )}
          </div>
        </ScrollArea>

        {layoutConfig.maxVisibleNodes && filteredNodes.length > layoutConfig.maxVisibleNodes && (
          <div className="text-xs text-gray-500 text-center">
            +{filteredNodes.length - layoutConfig.maxVisibleNodes} more
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500">
          {panelLayout !== 'ultra-compact' && (
            <>
              <p className="hidden lg:block">Drag nodes to the canvas to create them</p>
              <p className="lg:hidden">Tap a node type, then tap on the canvas to place it</p>
            </>
          )}
          {layoutConfig.showNodeCount && filteredNodes.length > 0 && (
            <p className="mt-1">
              {filteredNodes.length} node{filteredNodes.length !== 1 ? 's' : ''} available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedNodePalette;
