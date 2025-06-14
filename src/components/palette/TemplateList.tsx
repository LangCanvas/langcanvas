
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { NodeTemplate } from '../../utils/nodeTemplates';
import TemplateItem from './TemplateItem';

interface TemplateListProps {
  templates: NodeTemplate[];
  onTemplateClick: (template: NodeTemplate) => void;
  onClearFilters?: () => void;
  hasFilters: boolean;
}

const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  onTemplateClick,
  onClearFilters,
  hasFilters
}) => {
  return (
    <ScrollArea className="flex-1">
      <div className="space-y-3 pr-3">
        {templates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No templates found</p>
            {hasFilters && onClearFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-xs text-blue-600 hover:text-blue-800 mt-2"
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          templates.map((template) => (
            <TemplateItem
              key={template.id}
              template={template}
              onClick={onTemplateClick}
            />
          ))
        )}
      </div>
    </ScrollArea>
  );
};

export default TemplateList;
