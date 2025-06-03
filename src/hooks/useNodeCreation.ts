
import { useState, useCallback, useRef } from 'react';
import { Node } from './useNodes';

interface UseNodeCreationProps {
  onAddNode: (type: Node['type'], x: number, y: number) => Node | null;
}

export const useNodeCreation = ({ onAddNode }: UseNodeCreationProps) => {
  const [isCreationInProgress, setIsCreationInProgress] = useState(false);
  const [pendingNodeType, setPendingNodeType] = useState<Node['type'] | null>(null);
  const lastCreationTimeRef = useRef<number>(0);
  const lastCreationPositionRef = useRef<{ x: number; y: number } | null>(null);

  const CREATION_COOLDOWN = 300; // ms
  const POSITION_THRESHOLD = 50; // pixels

  const canCreateNode = useCallback((x: number, y: number): boolean => {
    const now = Date.now();
    const timeSinceLastCreation = now - lastCreationTimeRef.current;
    
    // Check time-based cooldown
    if (timeSinceLastCreation < CREATION_COOLDOWN) {
      console.log('🚫 Node creation blocked: too soon after last creation');
      return false;
    }

    // Check position-based deduplication
    if (lastCreationPositionRef.current) {
      const dx = Math.abs(x - lastCreationPositionRef.current.x);
      const dy = Math.abs(y - lastCreationPositionRef.current.y);
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < POSITION_THRESHOLD && timeSinceLastCreation < CREATION_COOLDOWN * 2) {
        console.log('🚫 Node creation blocked: too close to last creation position');
        return false;
      }
    }

    return true;
  }, []);

  const createNode = useCallback((type: Node['type'], x: number, y: number): Node | null => {
    if (isCreationInProgress) {
      console.log('🚫 Node creation blocked: creation already in progress');
      return null;
    }

    if (!canCreateNode(x, y)) {
      return null;
    }

    console.log(`✅ Creating node: ${type} at (${x}, ${y})`);
    
    setIsCreationInProgress(true);
    
    try {
      const node = onAddNode(type, x, y);
      
      if (node) {
        lastCreationTimeRef.current = Date.now();
        lastCreationPositionRef.current = { x, y };
        
        // Clear any pending state
        setPendingNodeType(null);
        
        // Clear any DOM attributes
        const canvas = document.getElementById('canvas');
        if (canvas) {
          canvas.removeAttribute('data-node-type');
        }
        
        // Remove instruction messages
        const instructions = document.querySelectorAll('.fixed.bg-blue-100');
        instructions.forEach(inst => {
          if (document.body.contains(inst)) {
            document.body.removeChild(inst);
          }
        });
      }
      
      return node;
    } finally {
      // Always clear the creation flag after a short delay
      setTimeout(() => {
        setIsCreationInProgress(false);
      }, 100);
    }
  }, [isCreationInProgress, canCreateNode, onAddNode]);

  const setPendingCreation = useCallback((type: Node['type'] | null) => {
    setPendingNodeType(type);
  }, []);

  const clearPendingCreation = useCallback(() => {
    setPendingNodeType(null);
    const canvas = document.getElementById('canvas');
    if (canvas) {
      canvas.removeAttribute('data-node-type');
    }
  }, []);

  return {
    createNode,
    pendingNodeType,
    setPendingCreation,
    clearPendingCreation,
    isCreationInProgress
  };
};
