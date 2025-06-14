
import React from 'react';
import { Button } from './button';
import { Plus, Search, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline';
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = ''
}) => (
  <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
    {icon && (
      <div className="mb-4 p-3 rounded-full bg-gray-100">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 mb-6 max-w-sm">{description}</p>
    {action && (
      <Button 
        onClick={action.onClick} 
        variant={action.variant || 'default'}
        className="flex items-center space-x-2"
      >
        {action.label}
      </Button>
    )}
  </div>
);

export const EmptyCanvas: React.FC<{ onAddNode?: () => void }> = ({ onAddNode }) => (
  <EmptyState
    icon={<Plus className="w-6 h-6 text-gray-400" />}
    title="No nodes yet"
    description="Start building your workflow by adding nodes from the palette on the left"
    action={onAddNode ? {
      label: 'Add your first node',
      onClick: onAddNode
    } : undefined}
    className="h-full"
  />
);

export const EmptyNodePalette: React.FC<{ onClearFilters?: () => void }> = ({ onClearFilters }) => (
  <EmptyState
    icon={<Search className="w-6 h-6 text-gray-400" />}
    title="No nodes found"
    description="Try adjusting your search terms or clearing the filters"
    action={onClearFilters ? {
      label: 'Clear filters',
      onClick: onClearFilters,
      variant: 'outline'
    } : undefined}
  />
);

export const EmptyTemplates: React.FC<{ onCreateTemplate?: () => void }> = ({ onCreateTemplate }) => (
  <EmptyState
    icon={<Sparkles className="w-6 h-6 text-gray-400" />}
    title="No templates available"
    description="Create your first template to quickly build common workflow patterns"
    action={onCreateTemplate ? {
      label: 'Create template',
      onClick: onCreateTemplate
    } : undefined}
  />
);

export const EmptySearch: React.FC<{ searchTerm: string; onClearSearch?: () => void }> = ({ 
  searchTerm, 
  onClearSearch 
}) => (
  <EmptyState
    icon={<Search className="w-6 h-6 text-gray-400" />}
    title={`No results for "${searchTerm}"`}
    description="Try searching with different keywords or browse all available options"
    action={onClearSearch ? {
      label: 'Clear search',
      onClick: onClearSearch,
      variant: 'outline'
    } : undefined}
  />
);
