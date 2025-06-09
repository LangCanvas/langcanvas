
import { EnhancedNode } from './nodeTypes';

export interface BaseNodeProps {
  node: EnhancedNode;
  isSelected: boolean;
  canCreateEdge: boolean;
  onSelect: (id: string) => void;
  onDoubleClick?: () => void;
  onMove: (id: string, x: number, y: number) => void;
  onDragStart?: (event: React.MouseEvent) => void;
  onStartConnection: (sourceNode: EnhancedNode, startX: number, startY: number) => void;
  validationClass?: string;
  validationTooltip?: string;
}

export interface DragState {
  isDragging: boolean;
  dragOffset: { x: number; y: number };
}
