
import React from 'react';
import { PanelLeftClose } from 'lucide-react';

interface PaletteHeaderProps {
  title: string;
  onToggle?: () => void;
}

const PaletteHeader: React.FC<PaletteHeaderProps> = ({ title, onToggle }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-medium text-gray-700 text-center flex-1">{title}</h2>
      {onToggle && (
        <button
          onClick={onToggle}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          title="Collapse Node Palette"
        >
          <PanelLeftClose className="w-4 h-4 text-gray-700" />
        </button>
      )}
    </div>
  );
};

export default PaletteHeader;
