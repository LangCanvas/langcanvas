
import { EnhancedNode } from '../types/nodeTypes';

export const getNodeDimensions = (nodeType: string) => {
  if (nodeType === 'conditional') {
    return { width: 80, height: 80 };
  }
  return { width: 120, height: 60 };
};

export const getNodeCenter = (node: EnhancedNode) => {
  const { width, height } = getNodeDimensions(node.type);
  return {
    x: node.x + width / 2,
    y: node.y + height / 2
  };
};

export const getNodeEdgePoint = (node: EnhancedNode, targetX: number, targetY: number) => {
  const { width, height } = getNodeDimensions(node.type);
  const center = getNodeCenter(node);
  
  // Calculate direction to target
  const dx = targetX - center.x;
  const dy = targetY - center.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance === 0) return center;
  
  const unitX = dx / distance;
  const unitY = dy / distance;
  
  // Calculate edge point based on node shape
  let edgeX, edgeY;
  
  if (node.type === 'conditional') {
    // Diamond shape - use radius
    const radius = Math.min(width, height) / 2;
    edgeX = center.x + unitX * radius;
    edgeY = center.y + unitY * radius;
  } else {
    // Rectangle shape - find intersection with rectangle edge
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    
    // Calculate which edge the line intersects
    const absUnitX = Math.abs(unitX);
    const absUnitY = Math.abs(unitY);
    
    if (halfHeight * absUnitX > halfWidth * absUnitY) {
      // Intersects left or right edge
      edgeX = center.x + (unitX > 0 ? halfWidth : -halfWidth);
      edgeY = center.y + unitY * halfWidth / absUnitX;
    } else {
      // Intersects top or bottom edge
      edgeX = center.x + unitX * halfHeight / absUnitY;
      edgeY = center.y + (unitY > 0 ? halfHeight : -halfHeight);
    }
  }
  
  return { x: edgeX, y: edgeY };
};

export const getConnectionPoints = (sourceNode: EnhancedNode, targetNode: EnhancedNode) => {
  const sourceCenter = getNodeCenter(sourceNode);
  const targetCenter = getNodeCenter(targetNode);
  
  const start = getNodeEdgePoint(sourceNode, targetCenter.x, targetCenter.y);
  const end = getNodeEdgePoint(targetNode, sourceCenter.x, sourceCenter.y);
  
  return { start, end };
};
