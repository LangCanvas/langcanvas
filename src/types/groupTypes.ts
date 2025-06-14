
export interface NodeGroup {
  id: string;
  name: string;
  description?: string;
  color: string;
  nodeIds: string[];
  collapsed: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  metadata: {
    created: string;
    updated: string;
    tags: string[];
  };
}

export interface GroupBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}
