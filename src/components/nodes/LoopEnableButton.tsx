
import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { EnhancedNode } from '../../types/nodeTypes';

interface LoopEnableButtonProps {
  node: EnhancedNode;
  isLoopEnabled: boolean;
  hasLoopWarnings: boolean;
  onToggleLoop: () => void;
  className?: string;
}

const LoopEnableButton: React.FC<LoopEnableButtonProps> = ({
  node,
  isLoopEnabled,
  hasLoopWarnings,
  onToggleLoop,
  className = ''
}) => {
  // Don't show loop button for start/end nodes
  if (node.type === 'start' || node.type === 'end') {
    return null;
  }

  const getButtonVariant = () => {
    if (hasLoopWarnings) return 'destructive';
    if (isLoopEnabled) return 'default';
    return 'ghost';
  };

  const getButtonColor = () => {
    if (hasLoopWarnings) return 'text-orange-600';
    if (isLoopEnabled) return 'text-blue-600';
    return 'text-gray-400';
  };

  const getTooltip = () => {
    if (hasLoopWarnings) return 'Loop enabled with warnings - click to configure';
    if (isLoopEnabled) return 'Loop enabled - click to configure';
    return 'Enable loop for this node';
  };

  return (
    <Button
      variant={getButtonVariant()}
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        onToggleLoop();
      }}
      className={`absolute top-1 right-1 w-6 h-6 p-0 ${className}`}
      title={getTooltip()}
    >
      <RotateCcw className={`w-3 h-3 ${getButtonColor()}`} />
    </Button>
  );
};

export default LoopEnableButton;
