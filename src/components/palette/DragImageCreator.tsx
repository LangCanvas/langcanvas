
import { NodeType } from '../../types/nodeTypes';

export const createDragImage = (nodeType: NodeType, label: string): HTMLElement => {
  const dragImage = document.createElement('div');
  dragImage.style.position = 'absolute';
  dragImage.style.top = '-1000px';
  dragImage.style.display = 'flex';
  dragImage.style.alignItems = 'center';
  dragImage.style.justifyContent = 'center';
  dragImage.style.fontSize = '14px';
  dragImage.style.fontWeight = '500';
  dragImage.style.userSelect = 'none';
  dragImage.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  dragImage.style.zIndex = '1000';
  dragImage.textContent = label;

  if (nodeType === 'conditional') {
    dragImage.style.width = '80px';
    dragImage.style.height = '80px';
    dragImage.style.backgroundColor = '#fff4e6';
    dragImage.style.border = '3px solid #ea580c';
    dragImage.style.color = '#9a3412';
    dragImage.style.clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
    dragImage.style.fontSize = '12px';
    dragImage.style.fontWeight = '600';
  } else {
    dragImage.style.width = '120px';
    dragImage.style.height = '60px';
    dragImage.style.border = '2px solid';
    
    switch (nodeType) {
      case 'start':
        dragImage.style.backgroundColor = '#f0fdf4';
        dragImage.style.borderColor = '#22c55e';
        dragImage.style.color = '#15803d';
        dragImage.style.borderRadius = '30px';
        break;
      case 'agent':
        dragImage.style.backgroundColor = '#f0fdf4';
        dragImage.style.borderColor = '#22c55e';
        dragImage.style.color = '#15803d';
        dragImage.style.borderRadius = '8px';
        break;
      case 'tool':
        dragImage.style.backgroundColor = '#eff6ff';
        dragImage.style.borderColor = '#3b82f6';
        dragImage.style.color = '#1d4ed8';
        dragImage.style.borderRadius = '8px';
        break;
      case 'function':
        dragImage.style.backgroundColor = '#faf5ff';
        dragImage.style.borderColor = '#a855f7';
        dragImage.style.color = '#7c3aed';
        dragImage.style.borderRadius = '8px';
        break;
      case 'parallel':
        dragImage.style.backgroundColor = '#ecfeff';
        dragImage.style.borderColor = '#06b6d4';
        dragImage.style.color = '#0e7490';
        dragImage.style.borderRadius = '8px';
        break;
      case 'end':
        dragImage.style.backgroundColor = '#fef2f2';
        dragImage.style.borderColor = '#ef4444';
        dragImage.style.color = '#b91c1c';
        dragImage.style.borderRadius = '30px';
        break;
      default:
        dragImage.style.borderRadius = '8px';
    }
  }

  return dragImage;
};
