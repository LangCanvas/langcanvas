
import React from 'react';
import { EnhancedEdge } from '../../types/edgeTypes';
import { BaseNodeProps } from '../../types/nodeProps';
import { getConditionalNodeStyle } from './NodeStyles';
import { useNodeDrag } from '../../hooks/useNodeDrag';
import BaseNode from './BaseNode';
import LeftConnectionHandle from '../connection/LeftConnectionHandle';
import RightConnectionHandle from '../connection/RightConnectionHandle';

interface ConditionalNodeProps extends BaseNodeProps {
  outgoingEdges: EnhancedEdge[];
}

const ConditionalNode: React.FC<ConditionalNodeProps> = (props) => {
  const { node, isSelected, canCreateEdge, onStartConnection, outgoingEdges } = props;
  const { isDragging } = useNodeDrag(node, props.onMove, isSelected);
  
  const nodeStyle = getConditionalNodeStyle(node, isSelected, isDragging);
  const conditionCount = outgoingEdges.filter(edge => edge.conditional).length;

  return (
    <BaseNode {...props} nodeStyle={nodeStyle}>
      <LeftConnectionHandle 
        node={node}
        isVisible={true}
      />
      <RightConnectionHandle
        node={node}
        canCreateEdge={canCreateEdge}
        onStartConnection={onStartConnection}
        isVisible={true}
      />
      
      {conditionCount > 0 && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
          {conditionCount}
        </div>
      )}
    </BaseNode>
  );
};

export default ConditionalNode;
