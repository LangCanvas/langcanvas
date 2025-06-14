
import React from 'react';
import { Button } from '@/components/ui/button';
import { nodeCategories } from '../../utils/nodeCategories';

interface NodeCategorySelectorProps {
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  compact?: boolean;
  iconOnly?: boolean;
}

const NodeCategorySelector: React.FC<NodeCategorySelectorProps> = ({
  selectedCategory,
  onCategorySelect,
  compact = false,
  iconOnly = false
}) => {
  return (
    <div className="space-y-2">
      {!iconOnly && (
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Categories
        </div>
      )}
      
      <div className="flex flex-col space-y-1">
        <Button
          variant={selectedCategory === null ? "default" : "ghost"}
          size="sm"
          onClick={() => onCategorySelect(null)}
          className={`justify-start text-xs h-8 ${iconOnly ? 'w-8 px-0' : ''}`}
          title={iconOnly ? "All Nodes" : "Show all node types"}
        >
          <span className={iconOnly ? '' : 'mr-2'}>📋</span>
          {!iconOnly && !compact && "All Nodes"}
        </Button>
        
        {nodeCategories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "ghost"}
            size="sm"
            onClick={() => onCategorySelect(category.id)}
            className={`justify-start text-xs h-8 ${iconOnly ? 'w-8 px-0' : ''}`}
            title={iconOnly || compact ? category.label : category.description}
          >
            <span className={iconOnly ? '' : 'mr-2'}>{category.icon}</span>
            {!iconOnly && !compact && category.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default NodeCategorySelector;
