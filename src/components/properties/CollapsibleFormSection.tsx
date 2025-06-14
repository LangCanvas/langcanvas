
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleFormSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  variant?: 'default' | 'accent';
  description?: string;
}

const CollapsibleFormSection: React.FC<CollapsibleFormSectionProps> = ({
  title,
  children,
  defaultOpen = true,
  variant = 'default',
  description
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn(
      "border rounded-lg transition-all duration-200",
      variant === 'accent' ? "border-blue-200 bg-blue-50/50" : "border-gray-200 bg-gray-50/50"
    )}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between p-4 h-auto hover:bg-transparent"
      >
        <div className="flex flex-col items-start">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900">{title}</span>
          </div>
          {description && (
            <span className="text-xs text-gray-600 mt-1">{description}</span>
          )}
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
      </Button>
      
      {isOpen && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleFormSection;
