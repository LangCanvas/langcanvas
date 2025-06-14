
import React, { useState, useMemo } from 'react';
import { PanelLeftClose } from 'lucide-react';
import { NodeType } from '../../types/nodeTypes';
import { getAllNodes, getNodesByCategory, searchNodes, NodeDefinition } from '../../utils/nodeCategories';
import { useEnhancedAnalytics } from '../../hooks/useEnhancedAnalytics';
import { PanelLayout } from '../../hooks/useAdaptivePanelWidths';
import NodePaletteSearch from './NodePaletteSearch';
import NodeCategorySelector from './NodeCategorySelector';
import PaletteContent from './PaletteContent';
import PaletteFooter from './PaletteFooter';
import { getLayoutConfig } from './PaletteLayoutConfig';

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

  const layoutConfig = getLayoutConfig(panelLayout);
  const displayNodes = layoutConfig.maxVisibleNodes 
    ? filteredNodes.slice(0, layoutConfig.maxVisibleNodes)
    : filteredNodes;

  const paddingClass = panelLayout === 'icon-only' ? 'p-1' : panelLayout === 'ultra-compact' ? 'p-2' : panelLayout === 'compact' ? 'p-3' : 'p-4';

  return (
    <div className={`${paddingClass} h-full flex flex-col`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`font-medium text-gray-700 ${panelLayout === 'icon-only' || panelLayout === 'ultra-compact' ? 'text-xs' : 'text-sm'}`}>
          {panelLayout === 'icon-only' ? '' : panelLayout === 'ultra-compact' ? 'Nodes' : 'Node Palette'}
        </h2>
        {onToggle && panelLayout !== 'ultra-compact' && panelLayout !== 'icon-only' && (
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
            iconOnly={layoutConfig.iconOnlyCategories}
          />
        )}

        <PaletteContent
          displayNodes={displayNodes}
          filteredNodes={filteredNodes}
          layoutConfig={layoutConfig}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          panelLayout={panelLayout}
          onDragStart={handleDragStart}
          onClick={handleClick}
          onClearSearch={handleClearSearch}
        />

        <PaletteFooter
          panelLayout={panelLayout}
          layoutConfig={layoutConfig}
          filteredNodesCount={filteredNodes.length}
          maxVisibleNodes={layoutConfig.maxVisibleNodes}
          totalDisplayed={displayNodes.length}
        />
      </div>
    </div>
  );
};

export default EnhancedNodePalette;
