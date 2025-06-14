
import React from 'react';

const ToolbarBrand: React.FC = () => {
  return (
    <div className="flex items-center space-x-2">
      <img 
        src="/icon.png" 
        alt="LangCanvas" 
        className="w-10 h-8 sm:w-12 sm:h-10"
        style={{ transform: 'scaleX(1.2)' }}
      />
    </div>
  );
};

export default ToolbarBrand;
