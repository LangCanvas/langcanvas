
export interface CanvasCoordinates {
  x: number;
  y: number;
}

export const getCanvasCoordinates = (
  event: MouseEvent | React.MouseEvent,
  canvasRef: React.RefObject<HTMLDivElement>
): CanvasCoordinates => {
  const canvas = canvasRef.current;
  if (!canvas) return { x: 0, y: 0 };

  const rect = canvas.getBoundingClientRect();
  const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
  const scrollLeft = scrollContainer?.scrollLeft || 0;
  const scrollTop = scrollContainer?.scrollTop || 0;
  
  const clientX = 'clientX' in event ? event.clientX : (event as MouseEvent).clientX;
  const clientY = 'clientY' in event ? event.clientY : (event as MouseEvent).clientY;
  
  return {
    x: clientX - rect.left + scrollLeft,
    y: clientY - rect.top + scrollTop
  };
};

export const getNodeDimensions = (nodeId: string) => {
  const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`) as HTMLElement;
  if (!nodeElement) {
    console.warn(`Node element not found for ID: ${nodeId}`);
    return { width: 120, height: 60 };
  }
  
  const rect = nodeElement.getBoundingClientRect();
  
  console.log(`📏 Node ${nodeId} dimensions:`, {
    domRect: { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
  });
  
  return { 
    width: rect.width, 
    height: rect.height
  };
};

export const getNodeCanvasPosition = (nodeId: string, canvasRef: React.RefObject<HTMLDivElement>) => {
  const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`) as HTMLElement;
  const canvas = canvasRef.current;
  
  if (!nodeElement || !canvas) {
    console.warn(`Cannot get canvas position for node ${nodeId} - element or canvas not found`);
    return { x: 0, y: 0 };
  }

  const nodeRect = nodeElement.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');
  const scrollLeft = scrollContainer?.scrollLeft || 0;
  const scrollTop = scrollContainer?.scrollTop || 0;

  const canvasX = nodeRect.left - canvasRect.left + scrollLeft;
  const canvasY = nodeRect.top - canvasRect.top + scrollTop;

  console.log(`📍 Node ${nodeId} canvas position:`, { canvasX, canvasY });
  
  return { x: canvasX, y: canvasY };
};

export const isNodeInRectangle = (
  nodeId: string,
  canvasRef: React.RefObject<HTMLDivElement>,
  rectLeft: number,
  rectTop: number,
  rectRight: number,
  rectBottom: number
): boolean => {
  const nodePosition = getNodeCanvasPosition(nodeId, canvasRef);
  const nodeDimensions = getNodeDimensions(nodeId);
  
  const nodeLeft = nodePosition.x;
  const nodeRight = nodePosition.x + nodeDimensions.width;
  const nodeTop = nodePosition.y;
  const nodeBottom = nodePosition.y + nodeDimensions.height;

  console.log(`🔍 Intersection check for ${nodeId}:`, {
    node: { left: nodeLeft, right: nodeRight, top: nodeTop, bottom: nodeBottom },
    rect: { left: rectLeft, right: rectRight, top: rectTop, bottom: rectBottom }
  });

  const intersects = (
    nodeLeft < rectRight &&
    nodeRight > rectLeft &&
    nodeTop < rectBottom &&
    nodeBottom > rectTop
  );

  console.log(`🎯 Node ${nodeId} intersection result: ${intersects}`);
  
  return intersects;
};

export const getNodesBoundingBox = (nodeIds: string[], canvasRef: React.RefObject<HTMLDivElement>) => {
  if (nodeIds.length === 0) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const nodeId of nodeIds) {
    const position = getNodeCanvasPosition(nodeId, canvasRef);
    const dimensions = getNodeDimensions(nodeId);
    
    minX = Math.min(minX, position.x);
    minY = Math.min(minY, position.y);
    maxX = Math.max(maxX, position.x + dimensions.width);
    maxY = Math.max(maxY, position.y + dimensions.height);
  }

  return { minX, minY, maxX, maxY };
};
