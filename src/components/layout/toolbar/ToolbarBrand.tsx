
import React from 'react';

const ToolbarBrand: React.FC = () => {
  return (
    <div className="flex items-center space-x-2">
      <img 
        src="/icon.png" 
        alt="LangCanvas" 
        className="w-16 h-16 sm:w-20 sm:h-20"
      />
    </div>
  );
};

export default ToolbarBrand;
