
import React from 'react';
import { BaseNodeProps } from '../../types/nodeProps';
import { getRegularNodeStyle } from './NodeStyles';
import { useNodeDrag } from '../../hooks/useNodeDrag';
import BaseNode from './BaseNode';
import LeftConnectionHandle from '../connection/LeftConnectionHandle';
import RightConnectionHandle from '../connection/RightConnectionHandle';

const RegularNode: React.FC<BaseNodeProps> = (props) => {
  const { node, isSelected, canCreateEdge, onStartConnection } = props;
  const { isDragging } = useNodeDrag(node, props.onMove, isSelected);
  
  const nodeStyle = getRegularNodeStyle(node, isSelected, isDragging);

  return (
    <BaseNode {...props} nodeStyle={nodeStyle}>
      <LeftConnectionHandle 
        node={node}
        isVisible={node.type !== 'start'}
      />
      <RightConnectionHandle
        node={node}
        canCreateEdge={canCreateEdge}
        onStartConnection={onStartConnection}
        isVisible={node.type !== 'end'}
      />
    </BaseNode>
  );
};

export default RegularNode;
