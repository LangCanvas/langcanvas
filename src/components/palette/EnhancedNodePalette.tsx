import React, { useState, useMemo, useEffect } from 'react';
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
  isExpanded?: boolean;
  panelWidth?: number;
  panelLayout?: PanelLayout;
}

const EnhancedNodePalette: React.FC<EnhancedNodePaletteProps> = ({ 
  onNodeTypeSelect, 
  isExpanded = true,
  panelWidth = 140,
  panelLayout = 'medium'
}) => {
  const analytics = useEnhancedAnalytics();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Reset to "All Nodes" when switching between medium and small layouts
  useEffect(() => {
    setSelectedCategory(null);
    setSearchQuery('');
  }, [panelLayout]);

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

  const paddingClass = panelLayout === 'small' ? 'p-1' : 'p-3';

  return (
    <div className={`${paddingClass} h-full flex flex-col`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`font-medium text-gray-700 ${panelLayout === 'small' ? 'text-xs' : 'text-sm'}`}>
          {panelLayout === 'small' ? 'Nodes' : 'Node Palette'}
        </h2>
      </div>

      <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
        {layoutConfig.showSearch && (
          <NodePaletteSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            placeholder="Search nodes..."
          />
        )}

        {layoutConfig.showCategories && !searchQuery && (
          <NodeCategorySelector
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
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
