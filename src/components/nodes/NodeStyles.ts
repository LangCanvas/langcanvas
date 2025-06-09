
import { EnhancedNode } from '../../types/nodeTypes';

export const getConditionalNodeStyle = (node: EnhancedNode, isSelected: boolean, isDragging: boolean) => ({
  position: 'absolute' as const,
  left: node.x,
  top: node.y,
  width: '80px',
  height: '80px',
  backgroundColor: isSelected ? '#c2410c' : '#fff4e6',
  border: `3px solid ${isSelected ? '#c2410c' : '#ea580c'}`,
  color: isSelected ? '#ffffff' : '#9a3412',
  clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  fontSize: '12px',
  fontWeight: '600',
  boxShadow: isDragging ? '0 6px 16px rgba(234, 88, 12, 0.25)' : '0 3px 8px rgba(234, 88, 12, 0.15)',
  cursor: isDragging ? 'grabbing' : 'grab',
  userSelect: 'none' as const,
  touchAction: 'none',
  zIndex: isSelected ? 10 : 5,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const getRegularNodeStyle = (node: EnhancedNode, isSelected: boolean, isDragging: boolean) => {
  const baseStyle = {
    position: 'absolute' as const,
    left: node.x,
    top: node.y,
    width: '120px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    border: '2px solid',
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none' as const,
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.1)',
    zIndex: isSelected ? 10 : 5,
    touchAction: 'none',
  };

  switch (node.type) {
    case 'start':
      return {
        ...baseStyle,
        backgroundColor: isSelected ? '#15803d' : '#f0fdf4',
        borderColor: isSelected ? '#15803d' : '#22c55e',
        color: isSelected ? '#ffffff' : '#15803d',
        borderRadius: '30px',
      };
    case 'agent':
      return {
        ...baseStyle,
        backgroundColor: isSelected ? '#15803d' : '#f0fdf4',
        borderColor: isSelected ? '#15803d' : '#22c55e',
        color: isSelected ? '#ffffff' : '#15803d',
      };
    case 'tool':
      return {
        ...baseStyle,
        backgroundColor: isSelected ? '#1d4ed8' : '#eff6ff',
        borderColor: isSelected ? '#1d4ed8' : '#3b82f6',
        color: isSelected ? '#ffffff' : '#1d4ed8',
      };
    case 'function':
      return {
        ...baseStyle,
        backgroundColor: isSelected ? '#6d28d9' : '#faf5ff',
        borderColor: isSelected ? '#6d28d9' : '#a855f7',
        color: isSelected ? '#ffffff' : '#7c3aed',
      };
    case 'parallel':
      return {
        ...baseStyle,
        backgroundColor: isSelected ? '#0e7490' : '#ecfeff',
        borderColor: isSelected ? '#0e7490' : '#06b6d4',
        color: isSelected ? '#ffffff' : '#0e7490',
      };
    case 'end':
      return {
        ...baseStyle,
        backgroundColor: isSelected ? '#b91c1c' : '#fef2f2',
        borderColor: isSelected ? '#b91c1c' : '#ef4444',
        color: isSelected ? '#ffffff' : '#b91c1c',
        borderRadius: '30px',
      };
    default:
      return baseStyle;
  }
};
