
import React, { useState, useRef } from 'react';
import { Node as NodeType } from '../hooks/useNodes';

interface NodeComponentProps {
  node: NodeType;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
}

const NodeComponent: React.FC<NodeComponentProps> = ({ node, isSelected, onSelect, onMove }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect(node.id);
    
    const rect = nodeRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  React.useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = document.getElementById('canvas');
      const canvasRect = canvas?.getBoundingClientRect();
      
      if (canvasRect) {
        const newX = Math.max(0, Math.min(
          e.clientX - canvasRect.left - dragOffset.x,
          canvasRect.width - 120 // Node width
        ));
        const newY = Math.max(0, Math.min(
          e.clientY - canvasRect.top - dragOffset.y,
          canvasRect.height - 60 // Node height
        ));
        
        onMove(node.id, newX, newY);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, node.id, onMove]);

  const getNodeStyle = () => {
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
      zIndex: isSelected ? 10 : 1,
    };

    switch (node.type) {
      case 'start':
        return {
          ...baseStyle,
          backgroundColor: '#f0fdf4',
          borderColor: isSelected ? '#16a34a' : '#22c55e',
          color: '#15803d',
          borderRadius: '30px',
        };
      case 'tool':
        return {
          ...baseStyle,
          backgroundColor: '#eff6ff',
          borderColor: isSelected ? '#2563eb' : '#3b82f6',
          color: '#1d4ed8',
        };
      case 'condition':
        return {
          ...baseStyle,
          backgroundColor: '#fff7ed',
          borderColor: isSelected ? '#ea580c' : '#f97316',
          color: '#c2410c',
          transform: 'rotate(45deg)',
          fontSize: '12px',
        };
      case 'end':
        return {
          ...baseStyle,
          backgroundColor: '#fef2f2',
          borderColor: isSelected ? '#dc2626' : '#ef4444',
          color: '#b91c1c',
          borderRadius: '30px',
        };
      default:
        return baseStyle;
    }
  };

  return (
    <div
      ref={nodeRef}
      style={getNodeStyle()}
      onMouseDown={handleMouseDown}
      className={`node ${node.type}-node ${isSelected ? 'selected' : ''}`}
      data-node-id={node.id}
      data-node-type={node.type}
    >
      <span style={{ transform: node.type === 'condition' ? 'rotate(-45deg)' : 'none' }}>
        {node.name}
      </span>
    </div>
  );
};

export default NodeComponent;
