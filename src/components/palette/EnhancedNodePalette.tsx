import React, { useState, useMemo } from 'react';
import { NodeType } from '../../types/nodeTypes';
import { LeftPanelLayout } from '../../hooks/useLeftPanelState';
import { useEnhancedAnalytics } from '../../hooks/useEnhancedAnalytics';
import { createDragImage } from './DragImageCreator';
import PaletteHeader from './PaletteHeader';
import NodePaletteSearch from './NodePaletteSearch';
import NodeCategorySelector from './NodeCategorySelector';
import PaletteContent from './PaletteContent';
import PaletteFooter from './PaletteFooter';
import PaletteEmptyState from './PaletteEmptyState';
import { PaletteLayoutConfig } from './PaletteLayoutConfig';

interface EnhancedNodePaletteProps {
  onNodeTypeSelect?: (type: NodeType) => void;
  onToggle?: () => void;
  isExpanded?: boolean;
  panelWidth?: number;
  panelLayout?: LeftPanelLayout;
}

// Minimum width for objects within the panel
const MIN_OBJECT_WIDTH = 35; // Changed to 35px as requested

const EnhancedNodePalette: React.FC<EnhancedNodePaletteProps> = ({ 
  onNodeTypeSelect, 
  onToggle, 
  isExpanded = true,
  panelWidth = 256,
  panelLayout = 'medium'
}) => {
  const analytics = useEnhancedAnalytics();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [layoutConfig, setLayoutConfig] = useState<PaletteLayoutConfig>({
    showSearch: true,
    showCategories: true,
    showDescriptions: true,
    compactMode: false,
    iconSize: 'medium',
    textSize: 'sm',
  });

  const handleLayoutConfigChange = (newConfig: Partial<PaletteLayoutConfig>) => {
    setLayoutConfig(prevConfig => ({ ...prevConfig, ...newConfig }));
  };

  const handleDragStart = (e: React.DragEvent, nodeType: NodeType, label: string) => {
    analytics.trackFeatureUsage('node_palette_drag_start', { 
      nodeType, 
      method: 'drag_and_drop' 
    });

    const dragImage = createDragImage(nodeType, label);
    document.body.appendChild(dragImage);
    
    const isConditional = nodeType === 'conditional';
    const width = isConditional ? 80 : 120;
    const height = isConditional ? 80 : 60;
    const offsetX = width / 2;
    const offsetY = height / 2;
    
    e.dataTransfer.setDragImage(dragImage, offsetX, offsetY);
    e.dataTransfer.setData('text/plain', nodeType);
    e.dataTransfer.setData('application/offset', JSON.stringify({ x: offsetX, y: offsetY }));
    e.dataTransfer.effectAllowed = 'copy';
    
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
    }, 0);
  };

  const handleClick = (e: React.MouseEvent, nodeType: NodeType) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log(`🎯 Node palette clicked: ${nodeType}`);
    
    analytics.trackFeatureUsage('node_palette_click', { 
      nodeType, 
      method: 'click_to_select' 
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

  const filteredNodes = useMemo(() => {
    let nodes = Object.values(NodeType) as NodeType[];

    if (selectedCategory) {
      nodes = nodes.filter(nodeType => nodeType.startsWith(selectedCategory));
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      nodes = nodes.filter(nodeType => nodeType.toLowerCase().includes(lowerSearchTerm));
    }

    return nodes;
  }, [searchTerm, selectedCategory]);

  const hasNodes = filteredNodes.length > 0;

  return (
    <div className="flex flex-col h-full">
      <PaletteHeader title="Node Palette" onToggle={onToggle} />

      {layoutConfig.showSearch && (
        <NodePaletteSearch searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />
      )}

      {layoutConfig.showCategories && (
        <NodeCategorySelector
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
      )}

      {hasNodes ? (
        <PaletteContent
          nodes={filteredNodes}
          onDragStart={handleDragStart}
          onClick={handleClick}
          layoutConfig={layoutConfig}
          minObjectWidth={MIN_OBJECT_WIDTH}
        />
      ) : (
        <PaletteEmptyState searchTerm={searchTerm} selectedCategory={selectedCategory} />
      )}

      <PaletteFooter layoutConfig={layoutConfig} onLayoutConfigChange={handleLayoutConfigChange} />
    </div>
  );
};

export default EnhancedNodePalette;
