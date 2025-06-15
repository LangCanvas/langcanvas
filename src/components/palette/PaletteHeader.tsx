
import React from 'react';
import { PanelLeftClose } from 'lucide-react';

interface PaletteHeaderProps {
  title: string;
  onToggle?: () => void;
}

const PaletteHeader: React.FC<PaletteHeaderProps> = ({ title, onToggle }) => {
  return (
    <div className="relative flex items-center justify-center mb-4 h-8">
      <h2 className="text-sm font-medium text-gray-700 text-center">{title}</h2>
      {onToggle && (
        <button
          onClick={onToggle}
          className="absolute right-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          title="Collapse Node Palette"
        >
          <PanelLeftClose className="w-4 h-4 text-gray-700" />
        </button>
      )}
    </div>
  );
};

export default PaletteHeader;
