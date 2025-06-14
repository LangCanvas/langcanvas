import { EnhancedNode } from '../types/nodeTypes';
import { calculateEnhancedOrthogonalPath, updateEdgeCalculatorNodes } from './enhancedEdgeCalculations';

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

export const getLeftConnectionPoint = (node: EnhancedNode) => {
  const { height } = getNodeDimensions(node.type);
  return {
    x: node.x,
    y: node.y + height / 2
  };
};

export const getRightConnectionPoint = (node: EnhancedNode) => {
  const { width, height } = getNodeDimensions(node.type);
  return {
    x: node.x + width,
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

export const getOrthogonalConnectionPoints = (sourceNode: EnhancedNode, targetNode: EnhancedNode) => {
  // Always use right handle for source and left handle for target
  const start = getRightConnectionPoint(sourceNode);
  const end = getLeftConnectionPoint(targetNode);
  
  return { start, end };
};

export const calculateOrthogonalPath = (sourceNode: EnhancedNode, targetNode: EnhancedNode): { x: number, y: number }[] => {
  // Use the new A* pathfinding system
  try {
    return calculateEnhancedOrthogonalPath(sourceNode, targetNode);
  } catch (error) {
    console.warn('A* pathfinding failed, falling back to simple orthogonal routing:', error);
    
    // Fallback to original simple orthogonal routing
    const { start, end } = getOrthogonalConnectionPoints(sourceNode, targetNode);
    const sourceCenter = getNodeCenter(sourceNode);
    const targetCenter = getNodeCenter(targetNode);
    
    const horizontalGap = 50;
    const verticalTolerance = 20;
    const waypoints: { x: number, y: number }[] = [];
    
    waypoints.push(start);
    
    if (Math.abs(start.y - end.y) <= verticalTolerance && targetCenter.x > sourceCenter.x) {
      waypoints.push(end);
      return waypoints;
    }
    
    if (Math.abs(sourceCenter.x - targetCenter.x) <= horizontalGap * 2) {
      waypoints.push({ x: start.x, y: end.y });
      waypoints.push(end);
      return waypoints;
    }
    
    if (targetCenter.x > sourceCenter.x) {
      if (Math.abs(start.y - end.y) > verticalTolerance) {
        const midX = start.x + Math.max(horizontalGap, (end.x - start.x) / 2);
        waypoints.push({ x: midX, y: start.y });
        waypoints.push({ x: midX, y: end.y });
      }
    } else {
      const midX = start.x + horizontalGap;
      const midY1 = start.y;
      const midY2 = end.y;
      
      waypoints.push({ x: midX, y: midY1 });
      
      if (Math.abs(midY2 - midY1) > verticalTolerance) {
        const verticalMid = midY1 + (midY2 - midY1) / 2;
        waypoints.push({ x: midX, y: verticalMid });
        
        const targetMidX = end.x - horizontalGap;
        waypoints.push({ x: targetMidX, y: verticalMid });
        waypoints.push({ x: targetMidX, y: end.y });
      } else {
        waypoints.push({ x: midX, y: end.y });
      }
    }
    
    waypoints.push(end);
    return waypoints;
  }
};

// Export the node update function for external use
export const updatePathfindingNodes = updateEdgeCalculatorNodes;

export const getConnectionPoints = (sourceNode: EnhancedNode, targetNode: EnhancedNode) => {
  // For dual-handle system, always use right->left connections
  const start = getRightConnectionPoint(sourceNode);
  const end = getLeftConnectionPoint(targetNode);
  
  return { start, end };
};
