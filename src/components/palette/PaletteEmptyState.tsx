
import React from 'react';

interface PaletteEmptyStateProps {
  searchQuery: string;
  selectedCategory: string | null;
  onClearSearch: () => void;
}

const PaletteEmptyState: React.FC<PaletteEmptyStateProps> = ({
  searchQuery,
  selectedCategory,
  onClearSearch
}) => {
  return (
    <div className="text-center py-8 text-gray-500">
      <p className="text-sm">No nodes found</p>
      {(searchQuery || selectedCategory) && (
        <button
          onClick={onClearSearch}
          className="text-xs text-blue-600 hover:text-blue-800 mt-2"
        >
          Clear filters
        </button>
      )}
    </div>
  );
};

export default PaletteEmptyState;
