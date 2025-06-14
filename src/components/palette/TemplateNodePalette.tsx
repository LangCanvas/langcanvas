
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Sparkles } from 'lucide-react';
import { useNodeTemplates } from '../../hooks/useNodeTemplates';
import { NodeTemplate } from '../../utils/nodeTemplates';

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
      // Fallback behavior for template creation
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

  const categories = Array.from(new Set(filteredTemplates.map(t => t.category)));

  if (compact) {
    return (
      <div className="p-2 space-y-2 h-full flex flex-col">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-7 h-8 text-xs"
          />
        </div>
        
        <ScrollArea className="flex-1">
          <div className="space-y-1 pr-2">
            {filteredTemplates
              .filter(template => 
                localSearch === '' || 
                template.name.toLowerCase().includes(localSearch.toLowerCase()) ||
                template.description.toLowerCase().includes(localSearch.toLowerCase())
              )
              .slice(0, 3)
              .map((template) => (
                <Button
                  key={template.id}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-auto p-2 text-left"
                  onClick={() => handleTemplateClick(template)}
                >
                  <div className="flex items-start space-x-2">
                    <Sparkles className="w-3 h-3 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium truncate">{template.name}</div>
                      <div className="text-xs text-gray-500 truncate">{template.description}</div>
                    </div>
                  </div>
                </Button>
              ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

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

      <ScrollArea className="flex-1">
        <div className="space-y-3 pr-3">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No templates found</p>
              {(searchQuery || selectedCategory) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs text-blue-600 hover:text-blue-800 mt-2"
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors cursor-pointer"
                onClick={() => handleTemplateClick(template)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{template.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {template.nodeType}
                  </Badge>
                </div>
                
                <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {template.category}
                  </Badge>
                  
                  {template.tags.length > 0 && (
                    <div className="flex space-x-1">
                      {template.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs text-gray-400">#{tag}</span>
                      ))}
                      {template.tags.length > 2 && (
                        <span className="text-xs text-gray-400">+{template.tags.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

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
