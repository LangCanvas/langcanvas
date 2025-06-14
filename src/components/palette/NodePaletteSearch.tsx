
import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface NodePaletteSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

const NodePaletteSearch: React.FC<NodePaletteSearchProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = "Search nodes..."
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onSearchChange('');
  };

  return (
    <div className="relative">
      <div className={`relative flex items-center transition-all duration-200 ${
        isFocused ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      }`}>
        <Search className="absolute left-3 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="pl-10 pr-10 text-sm"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 h-6 w-6 p-0 hover:bg-gray-100"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      {searchQuery && (
        <div className="mt-1 text-xs text-gray-500">
          Searching for "{searchQuery}"
        </div>
      )}
    </div>
  );
};

export default NodePaletteSearch;
