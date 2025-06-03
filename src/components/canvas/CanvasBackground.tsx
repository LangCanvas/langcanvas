
import React from 'react';
import { Menu } from 'lucide-react';

interface CanvasBackgroundProps {
  isDragOver: boolean;
  isMobile: boolean;
  nodeCount: number;
}

const CanvasBackground: React.FC<CanvasBackgroundProps> = ({ isDragOver, isMobile, nodeCount }) => {
  const backgroundStyle = {
    backgroundImage: isDragOver 
      ? 'radial-gradient(circle, #dbeafe 1px, transparent 1px)'
      : 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
    backgroundSize: isMobile ? '15px 15px' : '20px 20px',
  };

  return (
    <div 
      className="canvas-background absolute inset-0"
      style={backgroundStyle}
    >
      {isDragOver && (
        <div className="absolute inset-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50/50 flex items-center justify-center">
          <p className="text-blue-600 font-medium text-sm sm:text-base">Drop node here</p>
        </div>
      )}
      
      {!isDragOver && nodeCount === 0 && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="text-center text-gray-400">
            <div className="mb-2">
              <Menu className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 opacity-30" />
            </div>
            <p className="text-base sm:text-lg font-medium mb-1">Welcome to LangCanvas</p>
            <p className="text-xs sm:text-sm">
              {isMobile ? 'Tap nodes from the palette to add them' : 'Drag nodes from the palette to start building your graph'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasBackground;
