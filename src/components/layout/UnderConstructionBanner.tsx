
import React, { useState, useEffect } from 'react';
import { X, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';

const UnderConstructionBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  // Check if banner was previously dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('under-construction-dismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('under-construction-dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="bg-yellow-500 text-yellow-900 px-4 py-2 text-sm font-medium relative z-50">
      <div className="flex items-center justify-center gap-2">
        <Wrench className="w-4 h-4" />
        <span className="text-center">
          🚧 LangCanvas is under active development - Features may be incomplete or change frequently
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-yellow-900 hover:bg-yellow-400"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

export default UnderConstructionBanner;
