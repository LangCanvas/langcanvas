
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Sparkles } from 'lucide-react';
import { NodeTemplate } from '../../utils/nodeTemplates';

interface TemplateCompactViewProps {
  templates: NodeTemplate[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onTemplateClick: (template: NodeTemplate) => void;
}

const TemplateCompactView: React.FC<TemplateCompactViewProps> = ({
  templates,
  searchQuery,
  onSearchChange,
  onTemplateClick
}) => {
  return (
    <div className="p-2 space-y-2 h-full flex flex-col">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-7 h-8 text-xs"
        />
      </div>
      
      <ScrollArea className="flex-1">
        <div className="space-y-1 pr-2">
          {templates.slice(0, 3).map((template) => (
            <Button
              key={template.id}
              variant="ghost"
              size="sm"
              className="w-full justify-start h-auto p-2 text-left"
              onClick={() => onTemplateClick(template)}
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
};

export default TemplateCompactView;
