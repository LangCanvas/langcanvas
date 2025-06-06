
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

export const getOrthogonalConnectionPoints = (sourceNode: EnhancedNode, targetNode: EnhancedNode) => {
  const { width: sourceWidth, height: sourceHeight } = getNodeDimensions(sourceNode.type);
  const { width: targetWidth, height: targetHeight } = getNodeDimensions(targetNode.type);
  
  const sourceCenter = getNodeCenter(sourceNode);
  const targetCenter = getNodeCenter(targetNode);
  
  // For orthogonal routing, prefer right edge for source and left edge for target
  const sourceRight = {
    x: sourceNode.x + sourceWidth,
    y: sourceCenter.y
  };
  
  const targetLeft = {
    x: targetNode.x,
    y: targetCenter.y
  };
  
  return { start: sourceRight, end: targetLeft };
};

export const calculateOrthogonalPath = (sourceNode: EnhancedNode, targetNode: EnhancedNode): { x: number, y: number }[] => {
  const { start, end } = getOrthogonalConnectionPoints(sourceNode, targetNode);
  const sourceCenter = getNodeCenter(sourceNode);
  const targetCenter = getNodeCenter(targetNode);
  
  const horizontalGap = 50; // Minimum horizontal spacing
  const verticalTolerance = 20; // Tolerance for considering nodes vertically aligned
  const waypoints: { x: number, y: number }[] = [];
  
  // Add starting point
  waypoints.push(start);
  
  // Check if nodes are vertically aligned (within tolerance) and can use straight line
  if (Math.abs(start.y - end.y) <= verticalTolerance && targetCenter.x > sourceCenter.x) {
    // Nodes are roughly horizontally aligned and target is to the right - use straight line
    waypoints.push(end);
    return waypoints;
  }
  
  // Check if nodes are horizontally close and vertically separated - use simple L-shape
  if (Math.abs(sourceCenter.x - targetCenter.x) <= horizontalGap * 2) {
    // Nodes are close horizontally - use simple vertical then horizontal path
    waypoints.push({ x: start.x, y: end.y });
    waypoints.push(end);
    return waypoints;
  }
  
  // Determine routing strategy based on relative positions
  if (targetCenter.x > sourceCenter.x) {
    // Target is to the right of source - simple L-shape
    if (Math.abs(start.y - end.y) > verticalTolerance) {
      // Not horizontally aligned, create L-shape
      const midX = start.x + Math.max(horizontalGap, (end.x - start.x) / 2);
      waypoints.push({ x: midX, y: start.y }); // Move right
      waypoints.push({ x: midX, y: end.y });   // Move vertically
    }
  } else {
    // Target is to the left of source - create S-shape going around
    const midX = start.x + horizontalGap;
    const midY1 = start.y;
    const midY2 = end.y;
    
    // Go right first, then around
    waypoints.push({ x: midX, y: midY1 });
    
    // If target is significantly above or below, go around
    if (Math.abs(midY2 - midY1) > verticalTolerance) {
      const verticalMid = midY1 + (midY2 - midY1) / 2;
      waypoints.push({ x: midX, y: verticalMid });
      
      // Go left to target column
      const targetMidX = end.x - horizontalGap;
      waypoints.push({ x: targetMidX, y: verticalMid });
      waypoints.push({ x: targetMidX, y: end.y });
    } else {
      // Direct path back if vertically close
      waypoints.push({ x: midX, y: end.y });
    }
  }
  
  // Add ending point
  waypoints.push(end);
  
  return waypoints;
};

export const getConnectionPoints = (sourceNode: EnhancedNode, targetNode: EnhancedNode) => {
  const sourceCenter = getNodeCenter(sourceNode);
  const targetCenter = getNodeCenter(targetNode);
  
  const start = getNodeEdgePoint(sourceNode, targetCenter.x, targetCenter.y);
  const end = getNodeEdgePoint(targetNode, sourceCenter.x, sourceCenter.y);
  
  return { start, end };
};
