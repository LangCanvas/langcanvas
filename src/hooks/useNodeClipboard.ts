
import { useCallback } from 'react';
import { EnhancedNode } from '../types/nodeTypes';
import { EnhancedEdge } from '../types/edgeTypes';
import {
  copyNodesToClipboard,
  pasteNodesFromClipboard,
  hasClipboardData,
  duplicateNode,
  clearClipboard
} from '../utils/nodeClipboard';

interface UseNodeClipboardProps {
  nodes: EnhancedNode[];
  edges: EnhancedEdge[];
  onAddNode: (node: EnhancedNode) => void;
  onAddEdge: (edge: EnhancedEdge) => void;
}

export const useNodeClipboard = ({
  nodes,
  edges,
  onAddNode,
  onAddEdge
}: UseNodeClipboardProps) => {
  const copyNodes = useCallback((selectedNodeIds: string[]) => {
    copyNodesToClipboard(nodes, edges, selectedNodeIds);
  }, [nodes, edges]);

  const pasteNodes = useCallback((
    targetX: number,
    targetY: number,
    offsetX: number = 50,
    offsetY: number = 50
  ) => {
    const clipboardData = pasteNodesFromClipboard(offsetX, offsetY);
    
    if (clipboardData) {
      // Adjust positions relative to target location
      const baseX = clipboardData.nodes.length > 0 ? clipboardData.nodes[0].x : 0;
      const baseY = clipboardData.nodes.length > 0 ? clipboardData.nodes[0].y : 0;
      
      clipboardData.nodes.forEach(node => {
        const adjustedNode = {
          ...node,
          x: targetX + (node.x - baseX),
          y: targetY + (node.y - baseY)
        };
        onAddNode(adjustedNode);
      });

      clipboardData.edges.forEach(edge => {
        onAddEdge(edge);
      });

      return clipboardData.nodes.length;
    }

    return 0;
  }, [onAddNode, onAddEdge]);

  const duplicateSelectedNode = useCallback((
    node: EnhancedNode,
    offsetX: number = 50,
    offsetY: number = 50
  ) => {
    const duplicatedNode = duplicateNode(node, offsetX, offsetY);
    onAddNode(duplicatedNode);
    return duplicatedNode;
  }, [onAddNode]);

  return {
    copyNodes,
    pasteNodes,
    duplicateNode: duplicateSelectedNode,
    hasClipboardData,
    clearClipboard
  };
};
