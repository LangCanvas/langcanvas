
import { EnhancedNode } from '../../types/nodeTypes';

export const getConditionalNodeStyle = (node: EnhancedNode, isSelected: boolean, isDragging: boolean) => ({
  position: 'absolute' as const,
  left: node.x,
  top: node.y,
  width: '80px',
  height: '80px',
  backgroundColor: isSelected ? '#f59e0b' : '#fef3c7',
  border: `3px solid ${isSelected ? '#d97706' : '#f59e0b'}`,
  color: isSelected ? '#ffffff' : '#92400e',
  clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  fontSize: '12px',
  fontWeight: '600',
  boxShadow: isDragging 
    ? '0 8px 24px rgba(245, 158, 11, 0.3)' 
    : isSelected 
      ? '0 4px 16px rgba(245, 158, 11, 0.2)' 
      : '0 2px 8px rgba(0, 0, 0, 0.08)',
  cursor: isDragging ? 'grabbing' : 'grab',
  userSelect: 'none' as const,
  touchAction: 'none',
  zIndex: isSelected ? 10 : 5,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease-out',
  transform: isDragging ? 'rotate(2deg) scale(1.05)' : 'rotate(0deg) scale(1)',
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
    borderRadius: '12px',
    border: '2px solid',
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none' as const,
    fontSize: '14px',
    fontWeight: '500',
    zIndex: isSelected ? 10 : 5,
    touchAction: 'none',
    transition: 'all 0.2s ease-out',
    transform: isDragging ? 'rotate(-1deg) scale(1.02)' : 'rotate(0deg) scale(1)',
  };

  switch (node.type) {
    case 'start':
      return {
        ...baseStyle,
        backgroundColor: isSelected ? '#22c55e' : '#dcfce7',
        borderColor: isSelected ? '#15803d' : '#22c55e',
        color: isSelected ? '#ffffff' : '#15803d',
        borderRadius: '30px',
        boxShadow: isDragging 
          ? '0 8px 24px rgba(34, 197, 94, 0.3)' 
          : isSelected 
            ? '0 4px 16px rgba(34, 197, 94, 0.2)' 
            : '0 2px 8px rgba(0, 0, 0, 0.08)',
      };
    case 'agent':
      return {
        ...baseStyle,
        backgroundColor: isSelected ? '#10b981' : '#d1fae5',
        borderColor: isSelected ? '#047857' : '#10b981',
        color: isSelected ? '#ffffff' : '#047857',
        boxShadow: isDragging 
          ? '0 8px 24px rgba(16, 185, 129, 0.3)' 
          : isSelected 
            ? '0 4px 16px rgba(16, 185, 129, 0.2)' 
            : '0 2px 8px rgba(0, 0, 0, 0.08)',
      };
    case 'tool':
      return {
        ...baseStyle,
        backgroundColor: isSelected ? '#3b82f6' : '#dbeafe',
        borderColor: isSelected ? '#1e40af' : '#3b82f6',
        color: isSelected ? '#ffffff' : '#1e40af',
        boxShadow: isDragging 
          ? '0 8px 24px rgba(59, 130, 246, 0.3)' 
          : isSelected 
            ? '0 4px 16px rgba(59, 130, 246, 0.2)' 
            : '0 2px 8px rgba(0, 0, 0, 0.08)',
      };
    case 'function':
      return {
        ...baseStyle,
        backgroundColor: isSelected ? '#8b5cf6' : '#ede9fe',
        borderColor: isSelected ? '#6d28d9' : '#8b5cf6',
        color: isSelected ? '#ffffff' : '#6d28d9',
        boxShadow: isDragging 
          ? '0 8px 24px rgba(139, 92, 246, 0.3)' 
          : isSelected 
            ? '0 4px 16px rgba(139, 92, 246, 0.2)' 
            : '0 2px 8px rgba(0, 0, 0, 0.08)',
      };
    case 'parallel':
      return {
        ...baseStyle,
        backgroundColor: isSelected ? '#06b6d4' : '#cffafe',
        borderColor: isSelected ? '#0891b2' : '#06b6d4',
        color: isSelected ? '#ffffff' : '#0891b2',
        boxShadow: isDragging 
          ? '0 8px 24px rgba(6, 182, 212, 0.3)' 
          : isSelected 
            ? '0 4px 16px rgba(6, 182, 212, 0.2)' 
            : '0 2px 8px rgba(0, 0, 0, 0.08)',
      };
    case 'end':
      return {
        ...baseStyle,
        backgroundColor: isSelected ? '#ef4444' : '#fee2e2',
        borderColor: isSelected ? '#dc2626' : '#ef4444',
        color: isSelected ? '#ffffff' : '#dc2626',
        borderRadius: '30px',
        boxShadow: isDragging 
          ? '0 8px 24px rgba(239, 68, 68, 0.3)' 
          : isSelected 
            ? '0 4px 16px rgba(239, 68, 68, 0.2)' 
            : '0 2px 8px rgba(0, 0, 0, 0.08)',
      };
    default:
      return {
        ...baseStyle,
        boxShadow: isDragging 
          ? '0 8px 24px rgba(0, 0, 0, 0.15)' 
          : isSelected 
            ? '0 4px 16px rgba(0, 0, 0, 0.12)' 
            : '0 2px 8px rgba(0, 0, 0, 0.08)',
      };
  }
};
