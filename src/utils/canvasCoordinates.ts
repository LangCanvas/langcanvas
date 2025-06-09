
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

export const isNodeInRectangle = (
  nodeX: number,
  nodeY: number,
  nodeWidth: number,
  nodeHeight: number,
  rectLeft: number,
  rectTop: number,
  rectRight: number,
  rectBottom: number
): boolean => {
  const nodeLeft = nodeX;
  const nodeRight = nodeX + nodeWidth;
  const nodeTop = nodeY;
  const nodeBottom = nodeY + nodeHeight;

  console.log(`🔍 Intersection check:`, {
    node: { left: nodeLeft, right: nodeRight, top: nodeTop, bottom: nodeBottom },
    rect: { left: rectLeft, right: rectRight, top: rectTop, bottom: rectBottom }
  });

  // Check if node overlaps with rectangle
  const intersects = (
    nodeLeft < rectRight &&
    nodeRight > rectLeft &&
    nodeTop < rectBottom &&
    nodeBottom > rectTop
  );

  console.log(`🎯 Node intersection result: ${intersects}`);
  
  return intersects;
};
