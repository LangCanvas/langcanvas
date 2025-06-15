
import React from 'react';
import { Button } from '@/components/ui/button';
import { nodeCategories } from '../../utils/nodeCategories';

interface NodeCategorySelectorProps {
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
}

const NodeCategorySelector: React.FC<NodeCategorySelectorProps> = ({
  selectedCategory,
  onCategorySelect,
}) => {
  return (
    <div className="space-y-2 pt-4">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide text-center">
        Categories
      </div>
      
      <div className="flex flex-col space-y-1">
        <Button
          variant={selectedCategory === null ? "default" : "ghost"}
          size="sm"
          onClick={() => onCategorySelect(null)}
          className="justify-center text-xs h-8"
          title="Show all node types"
        >
          <span className="mr-2">📋</span>
          All Nodes
        </Button>
        
        {nodeCategories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "ghost"}
            size="sm"
            onClick={() => onCategorySelect(category.id)}
            className="justify-center text-xs h-8"
            title={category.description}
          >
            <span className="mr-2">{category.icon}</span>
            {category.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default NodeCategorySelector;
