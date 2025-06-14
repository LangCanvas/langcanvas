
import React from 'react';
import { EnhancedNode } from '../../types/nodeTypes';
import { EnhancedEdge } from '../../types/edgeTypes';
import RegularNode from '../nodes/RegularNode';
import ConditionalNode from '../nodes/ConditionalNode';

interface CanvasNodesProps {
  nodes: EnhancedNode[];
  edges: EnhancedEdge[];
  selectedNodeId: string | null;
  selectedNodeIds: string[];
  hoveredNodeId: string | null;
  isMobile: boolean;
  canCreateEdge: (node: EnhancedNode) => boolean;
  onNodeSelect: (id: string, event?: React.MouseEvent) => void;
  onNodeDoubleClick: (nodeId: string) => void;
  onMoveNode: (id: string, x: number, y: number) => void;
  onNodeDragStart: (nodeId: string, event: React.PointerEvent) => void;
  onStartConnection: (sourceNode: EnhancedNode, startX: number, startY: number) => void;
  getNodeValidationClass?: (nodeId: string) => string;
  getNodeTooltip?: (nodeId: string) => string;
}

const CanvasNodes: React.FC<CanvasNodesProps> = ({
  nodes,
  edges,
  selectedNodeId,
  selectedNodeIds,
  hoveredNodeId,
  isMobile,
  canCreateEdge,
  onNodeSelect,
  onNodeDoubleClick,
  onMoveNode,
  onNodeDragStart,
  onStartConnection,
  getNodeValidationClass,
  getNodeTooltip,
}) => {
  return (
    <>
      {nodes.map((node) => {
        const isSelected = selectedNodeIds.includes(node.id);
        const isPrimarySelected = selectedNodeId === node.id;
        const displaySelected = isSelected || isPrimarySelected;
        const isHovered = hoveredNodeId === node.id;
        
        return (
          <div
            key={node.id}
            className={`${isHovered ? 'ring-2 ring-blue-400 ring-opacity-50 rounded-lg' : ''} ${
              displaySelected ? 'ring-4 ring-blue-500 ring-opacity-100 rounded-lg shadow-xl' : ''
            } ${
              isMobile ? 'touch-manipulation' : ''
            } transition-all duration-200`}
          >
            {node.type === 'conditional' ? (
              <ConditionalNode
                node={node}
                outgoingEdges={edges.filter(e => e.source === node.id)}
                isSelected={displaySelected}
                canCreateEdge={canCreateEdge(node)}
                onSelect={(id, event) => onNodeSelect(id, event)}
                onDoubleClick={() => onNodeDoubleClick(node.id)}
                onMove={onMoveNode}
                onDragStart={(event) => onNodeDragStart(node.id, event)}
                onStartConnection={onStartConnection}
                validationClass={getNodeValidationClass?.(node.id) || ''}
                validationTooltip={getNodeTooltip?.(node.id) || ''}
              />
            ) : (
              <RegularNode
                node={node}
                isSelected={displaySelected}
                canCreateEdge={canCreateEdge(node)}
                onSelect={(id, event) => onNodeSelect(id, event)}
                onDoubleClick={() => onNodeDoubleClick(node.id)}
                onMove={onMoveNode}
                onDragStart={(event) => onNodeDragStart(node.id, event)}
                onStartConnection={onStartConnection}
                validationClass={getNodeValidationClass?.(node.id) || ''}
                validationTooltip={getNodeTooltip?.(node.id) || ''}
              />
            )}
          </div>
        );
      })}
    </>
  );
};

export default CanvasNodes;
