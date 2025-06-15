
import React from 'react';

interface PaletteHeaderProps {
  title: string;
}

const PaletteHeader: React.FC<PaletteHeaderProps> = ({ title }) => {
  return (
    <div className="flex items-center justify-center mb-4 h-8">
      <h2 className="text-sm font-medium text-gray-700 text-center">{title}</h2>
    </div>
  );
};

export default PaletteHeader;
