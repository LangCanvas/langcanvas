
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NodeDefinition } from '../../utils/nodeCategories';
import { PanelLayout } from '../../types/panelTypes';
import { LayoutConfig } from './PaletteLayoutConfig';
import EnhancedNodeItem from './EnhancedNodeItem';
import PaletteEmptyState from './PaletteEmptyState';
import { NodeType } from '../../types/nodeTypes';

interface PaletteContentProps {
  displayNodes: NodeDefinition[];
  filteredNodes: NodeDefinition[];
  layoutConfig: LayoutConfig;
  searchQuery: string;
  selectedCategory: string | null;
  panelLayout: PanelLayout;
  onDragStart: (e: React.DragEvent, nodeType: NodeType, label: string) => void;
  onClick: (e: React.MouseEvent, nodeType: NodeType) => void;
  onClearSearch: () => void;
}

const PaletteContent: React.FC<PaletteContentProps> = ({
  displayNodes,
  filteredNodes,
  layoutConfig,
  searchQuery,
  selectedCategory,
  panelLayout,
  onDragStart,
  onClick,
  onClearSearch
}) => {
  return (
    <ScrollArea className="flex-1">
      <div className={`space-y-3 pr-3 ${layoutConfig.compactItems ? 'space-y-1' : ''}`}>
        {displayNodes.length === 0 ? (
          <PaletteEmptyState
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            onClearSearch={onClearSearch}
          />
        ) : (
          displayNodes.map((node) => (
            <EnhancedNodeItem
              key={node.type}
              node={node}
              onDragStart={onDragStart}
              onClick={onClick}
              showDescription={layoutConfig.showDescriptions}
              compact={layoutConfig.compactItems}
              panelLayout={panelLayout}
            />
          ))
        )}
      </div>
    </ScrollArea>
  );
};

export default PaletteContent;
