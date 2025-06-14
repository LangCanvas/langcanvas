
import React, { useMemo } from 'react';
import { EnhancedEdge } from '../../types/edgeTypes';
import { EnhancedNode } from '../../types/nodeTypes';
import { getNodeDimensions } from '../../utils/edgeCalculations';

interface EdgeVirtualizationProps {
  edges: EnhancedEdge[];
  nodes: EnhancedNode[];
  viewportBounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  children: (visibleEdges: EnhancedEdge[], lodLevel: 'high' | 'medium' | 'low') => React.ReactNode;
  virtualizeThreshold?: number;
  lodThresholds?: {
    high: number;
    medium: number;
  };
}

const EdgeVirtualization: React.FC<EdgeVirtualizationProps> = ({
  edges,
  nodes,
  viewportBounds,
  children,
  virtualizeThreshold = 100,
  lodThresholds = { high: 50, medium: 200 }
}) => {
  const nodeMap = useMemo(() => {
    return new Map(nodes.map(node => [node.id, node]));
  }, [nodes]);

  const { visibleEdges, lodLevel } = useMemo(() => {
    // If we're below the virtualization threshold, show all edges
    if (edges.length <= virtualizeThreshold) {
      return {
        visibleEdges: edges,
        lodLevel: 'high' as const
      };
    }

    // Determine LOD level based on edge count
    let currentLodLevel: 'high' | 'medium' | 'low' = 'high';
    if (edges.length > lodThresholds.medium) {
      currentLodLevel = 'low';
    } else if (edges.length > lodThresholds.high) {
      currentLodLevel = 'medium';
    }

    // Filter edges based on viewport visibility
    const visibleEdges = edges.filter(edge => {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);
      
      if (!sourceNode || !targetNode) return false;

      // Check if either node is in viewport
      const sourceInView = isNodeInViewport(sourceNode, viewportBounds);
      const targetInView = isNodeInViewport(targetNode, viewportBounds);
      
      if (sourceInView || targetInView) return true;

      // Check if edge path crosses viewport
      return doesEdgeCrossViewport(sourceNode, targetNode, viewportBounds);
    });

    // For low LOD, further reduce visible edges by importance
    if (currentLodLevel === 'low') {
      return {
        visibleEdges: visibleEdges.filter((_, index) => index % 2 === 0), // Show every other edge
        lodLevel: currentLodLevel
      };
    }

    return {
      visibleEdges,
      lodLevel: currentLodLevel
    };
  }, [edges, nodeMap, viewportBounds, virtualizeThreshold, lodThresholds]);

  return <>{children(visibleEdges, lodLevel)}</>;
};

const isNodeInViewport = (
  node: EnhancedNode,
  viewport: { minX: number; minY: number; maxX: number; maxY: number }
): boolean => {
  const buffer = 50; // Add buffer for smooth transitions
  const dimensions = getNodeDimensions(node.type);
  return (
    node.x + dimensions.width >= viewport.minX - buffer &&
    node.x <= viewport.maxX + buffer &&
    node.y + dimensions.height >= viewport.minY - buffer &&
    node.y <= viewport.maxY + buffer
  );
};

const doesEdgeCrossViewport = (
  sourceNode: EnhancedNode,
  targetNode: EnhancedNode,
  viewport: { minX: number; minY: number; maxX: number; maxY: number }
): boolean => {
  // Simple line-rectangle intersection check
  const lineMinX = Math.min(sourceNode.x, targetNode.x);
  const lineMaxX = Math.max(sourceNode.x, targetNode.x);
  const lineMinY = Math.min(sourceNode.y, targetNode.y);
  const lineMaxY = Math.max(sourceNode.y, targetNode.y);

  return !(
    lineMaxX < viewport.minX ||
    lineMinX > viewport.maxX ||
    lineMaxY < viewport.minY ||
    lineMinY > viewport.maxY
  );
};

export default EdgeVirtualization;
