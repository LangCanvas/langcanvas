
import React from 'react';
import { EnhancedEdge } from '../../types/edgeTypes';
import { BaseNodeProps } from '../../types/nodeProps';
import { getConditionalNodeStyle } from './NodeStyles';
import { useNodeDrag } from '../../hooks/useNodeDrag';
import BaseNode from './BaseNode';

interface ConditionalNodeProps extends BaseNodeProps {
  outgoingEdges: EnhancedEdge[];
}

const ConditionalNode: React.FC<ConditionalNodeProps> = (props) => {
  const { node, isSelected, canCreateEdge, onStartConnection, outgoingEdges } = props;
  const { isDragging } = useNodeDrag(node, props.onMove, isSelected);
  
  const nodeStyle = getConditionalNodeStyle(node, isSelected, isDragging);
  const conditionCount = outgoingEdges.filter(edge => edge.conditional).length;
  const maxConditions = 8;

  const handleConnectionStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    
    if (canCreateEdge) {
      const canvas = document.getElementById('canvas');
      const canvasRect = canvas?.getBoundingClientRect();
      const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
      
      if (canvasRect && scrollContainer) {
        const startX = node.x + 60;
        const startY = node.y + 40;
        onStartConnection(node, startX, startY);
      }
    }
  };

  return (
    <BaseNode {...props} nodeStyle={nodeStyle}>
      {canCreateEdge && conditionCount < maxConditions && (
        <div
          className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-orange-500 border-2 border-white rounded-full cursor-pointer hover:bg-orange-600 hover:scale-110 transition-all shadow-md"
          onMouseDown={handleConnectionStart}
          onTouchStart={handleConnectionStart}
          title="Add condition branch"
        />
      )}
      
      {conditionCount > 0 && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
          {conditionCount}
        </div>
      )}
    </BaseNode>
  );
};

export default ConditionalNode;
