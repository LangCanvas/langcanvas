
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { NodeTemplate } from '../../utils/nodeTemplates';

interface TemplateItemProps {
  template: NodeTemplate;
  onClick: (template: NodeTemplate) => void;
}

const TemplateItem: React.FC<TemplateItemProps> = ({ template, onClick }) => {
  return (
    <div
      className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors cursor-pointer"
      onClick={() => onClick(template)}
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
  );
};

export default TemplateItem;
