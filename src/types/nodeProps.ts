
import React from 'react';
import { EnhancedNode } from './nodeTypes';

export interface BaseNodeProps {
  node: EnhancedNode;
  isSelected: boolean;
  canCreateEdge: boolean;
  onSelect: (id: string, event?: React.MouseEvent) => void;
  onDoubleClick?: () => void;
  onMove: (id: string, x: number, y: number) => void;
  onDragStart?: (event: React.PointerEvent) => void;
  onStartConnection: (sourceNode: EnhancedNode, startX: number, startY: number) => void;
  validationClass?: string;
  validationTooltip?: string;
}

export interface DragState {
  isDragging: boolean;
  dragOffset: { x: number; y: number };
}

export type PointerDragEvent = React.PointerEvent;
