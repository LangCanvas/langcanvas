
import React from 'react';
import { BaseNodeProps } from '../../types/nodeProps';
import { getRegularNodeStyle } from './NodeStyles';
import { useNodeDrag } from '../../hooks/useNodeDrag';
import BaseNode from './BaseNode';
import ConnectionHandle from '../ConnectionHandle';

const RegularNode: React.FC<BaseNodeProps> = (props) => {
  const { node, isSelected, canCreateEdge, onStartConnection } = props;
  const { isDragging } = useNodeDrag(node, props.onMove);
  
  const nodeStyle = getRegularNodeStyle(node, isSelected, isDragging);

  return (
    <BaseNode {...props} nodeStyle={nodeStyle}>
      <ConnectionHandle
        node={node}
        canCreateEdge={canCreateEdge}
        onStartConnection={onStartConnection}
      />
    </BaseNode>
  );
};

export default RegularNode;
