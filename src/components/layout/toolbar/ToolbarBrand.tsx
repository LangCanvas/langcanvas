
import React from 'react';

const ToolbarBrand: React.FC = () => {
  return (
    <div className="flex items-center space-x-2">
      <img 
        src="/icon.png" 
        alt="LangCanvas" 
        className="w-8 h-8 sm:w-10 sm:h-10"
      />
    </div>
  );
};

export default ToolbarBrand;
