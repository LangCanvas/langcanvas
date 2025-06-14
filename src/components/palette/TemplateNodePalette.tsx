
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Sparkles } from 'lucide-react';
import { useNodeTemplates } from '../../hooks/useNodeTemplates';
import { NodeTemplate } from '../../utils/nodeTemplates';
import TemplateList from './TemplateList';
import TemplateCompactView from './TemplateCompactView';

interface TemplateNodePaletteProps {
  onTemplateSelect?: (templateId: string) => void;
  compact?: boolean;
}

const TemplateNodePalette: React.FC<TemplateNodePaletteProps> = ({
  onTemplateSelect,
  compact = false
}) => {
  const {
    filteredTemplates,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    clearFilters
  } = useNodeTemplates();

  const [localSearch, setLocalSearch] = useState('');

  const handleTemplateClick = (template: NodeTemplate) => {
    if (onTemplateSelect) {
      onTemplateSelect(template.id);
    } else {
      const canvas = document.getElementById('canvas');
      if (canvas) {
        canvas.setAttribute('data-template-id', template.id);
        
        const instruction = document.createElement('div');
        instruction.className = 'fixed top-4 left-4 right-4 bg-purple-100 border border-purple-300 rounded-lg p-3 text-purple-800 text-sm z-50 lg:hidden';
        instruction.textContent = `Tap on the canvas to create "${template.name}" from template`;
        document.body.appendChild(instruction);
        
        setTimeout(() => {
          if (document.body.contains(instruction)) {
            document.body.removeChild(instruction);
          }
        }, 3000);
      }
    }
  };

  if (compact) {
    const filteredByLocal = filteredTemplates.filter(template => 
      localSearch === '' || 
      template.name.toLowerCase().includes(localSearch.toLowerCase()) ||
      template.description.toLowerCase().includes(localSearch.toLowerCase())
    );

    return (
      <TemplateCompactView
        templates={filteredByLocal}
        searchQuery={localSearch}
        onSearchChange={setLocalSearch}
        onTemplateClick={handleTemplateClick}
      />
    );
  }

  const categories = Array.from(new Set(filteredTemplates.map(t => t.category)));

  return (
    <div className="p-4 h-full flex flex-col space-y-4">
      <div className="flex items-center space-x-2">
        <Sparkles className="w-4 h-4 text-purple-500" />
        <h3 className="text-sm font-medium text-gray-700">Node Templates</h3>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {!searchQuery && (
        <div className="flex flex-wrap gap-1">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="text-xs"
          >
            All
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-xs"
            >
              {category}
            </Button>
          ))}
        </div>
      )}

      <TemplateList
        templates={filteredTemplates}
        onTemplateClick={handleTemplateClick}
        onClearFilters={clearFilters}
        hasFilters={!!(searchQuery || selectedCategory)}
      />

      <div className="text-xs text-gray-500">
        <p className="hidden lg:block">Click a template to use it on the canvas</p>
        <p className="lg:hidden">Tap a template, then tap on the canvas to place it</p>
        {filteredTemplates.length > 0 && (
          <p className="mt-1">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
          </p>
        )}
      </div>
    </div>
  );
};

export default TemplateNodePalette;
