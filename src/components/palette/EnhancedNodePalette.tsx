
import React, { useState, useMemo } from 'react';
import { PanelLeftClose } from 'lucide-react';
import { NodeType } from '../../types/nodeTypes';
import { getAllNodes, getNodesByCategory, searchNodes, NodeDefinition } from '../../utils/nodeCategories';
import { useEnhancedAnalytics } from '../../hooks/useEnhancedAnalytics';
import NodePaletteSearch from './NodePaletteSearch';
import NodeCategorySelector from './NodeCategorySelector';
import EnhancedNodeItem from './EnhancedNodeItem';

interface EnhancedNodePaletteProps {
  onNodeTypeSelect?: (type: NodeType) => void;
  onToggle?: () => void;
  isExpanded?: boolean;
  compact?: boolean;
}

const EnhancedNodePalette: React.FC<EnhancedNodePaletteProps> = ({ 
  onNodeTypeSelect, 
  onToggle, 
  isExpanded = true,
  compact = false
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
      searchQuery: searchQuery || undefined
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
      searchQuery: searchQuery || undefined
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

  if (compact) {
    return (
      <div className="p-2 space-y-2">
        <NodePaletteSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Search..."
        />
        
        <div className="space-y-1">
          {filteredNodes.slice(0, 5).map((node) => (
            <EnhancedNodeItem
              key={node.type}
              node={node}
              onDragStart={handleDragStart}
              onClick={handleClick}
              showDescription={false}
              compact={true}
            />
          ))}
        </div>
        
        {filteredNodes.length > 5 && (
          <div className="text-xs text-gray-500 text-center">
            +{filteredNodes.length - 5} more
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-700">Node Palette</h2>
        {onToggle && (
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
        <NodePaletteSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {!searchQuery && (
          <NodeCategorySelector
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-3">
            {filteredNodes.length === 0 ? (
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
              filteredNodes.map((node) => (
                <EnhancedNodeItem
                  key={node.type}
                  node={node}
                  onDragStart={handleDragStart}
                  onClick={handleClick}
                  showDescription={true}
                  compact={false}
                />
              ))
            )}
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p className="hidden lg:block">Drag nodes to the canvas to create them</p>
          <p className="lg:hidden">Tap a node type, then tap on the canvas to place it</p>
          {filteredNodes.length > 0 && (
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
