
import React from 'react';
import { Button } from '@/components/ui/button';

interface RightPanelDebuggerProps {
  isVisible: boolean;
  panelWidth: number;
  onToggle: () => void;
}

const RightPanelDebugger: React.FC<RightPanelDebuggerProps> = ({
  isVisible,
  panelWidth,
  onToggle
}) => {
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
  
  React.useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div 
      className="fixed top-4 right-4 bg-white border-2 border-red-500 p-4 rounded shadow-lg z-50"
      style={{ backgroundColor: '#ffffff', border: '2px solid #ff0000' }}
    >
      <h3 className="font-bold text-red-600 mb-2">Right Panel Debug</h3>
      <div className="text-xs space-y-1">
        <p><strong>Is Visible:</strong> {isVisible ? 'TRUE' : 'FALSE'}</p>
        <p><strong>Panel Width:</strong> {panelWidth}px</p>
        <p><strong>Viewport:</strong> {dimensions.width}x{dimensions.height}</p>
        <p><strong>Expected %:</strong> {((panelWidth / dimensions.width) * 100).toFixed(1)}%</p>
      </div>
      <Button
        onClick={onToggle}
        size="sm"
        className="mt-2 w-full"
        variant={isVisible ? "destructive" : "default"}
      >
        {isVisible ? 'Hide' : 'Show'} Panel
      </Button>
    </div>
  );
};

export default RightPanelDebugger;
