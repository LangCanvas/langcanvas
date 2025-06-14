
import { EnhancedNode } from '../types/nodeTypes';
import { EnhancedEdge } from '../types/edgeTypes';

export interface ClipboardData {
  nodes: EnhancedNode[];
  edges: EnhancedEdge[];
  timestamp: number;
}

const CLIPBOARD_KEY = 'langcanvas_clipboard';

export const copyNodesToClipboard = (
  nodes: EnhancedNode[],
  edges: EnhancedEdge[],
  selectedNodeIds: string[]
): void => {
  try {
    const nodesToCopy = nodes.filter(node => selectedNodeIds.includes(node.id));
    const edgesToCopy = edges.filter(edge => 
      selectedNodeIds.includes(edge.source) && selectedNodeIds.includes(edge.target)
    );

    const clipboardData: ClipboardData = {
      nodes: nodesToCopy,
      edges: edgesToCopy,
      timestamp: Date.now()
    };

    localStorage.setItem(CLIPBOARD_KEY, JSON.stringify(clipboardData));
    console.log('📋 Copied', nodesToCopy.length, 'nodes and', edgesToCopy.length, 'edges to clipboard');
  } catch (error) {
    console.warn('Failed to copy nodes to clipboard:', error);
  }
};

export const getClipboardData = (): ClipboardData | null => {
  try {
    const stored = localStorage.getItem(CLIPBOARD_KEY);
    if (!stored) return null;

    const data: ClipboardData = JSON.parse(stored);
    
    // Check if clipboard data is not too old (24 hours)
    const maxAge = 24 * 60 * 60 * 1000;
    if (Date.now() - data.timestamp > maxAge) {
      clearClipboard();
      return null;
    }

    return data;
  } catch (error) {
    console.warn('Failed to read clipboard data:', error);
    return null;
  }
};

export const pasteNodesFromClipboard = (
  offsetX: number = 50,
  offsetY: number = 50
): { nodes: EnhancedNode[]; edges: EnhancedEdge[] } | null => {
  const clipboardData = getClipboardData();
  if (!clipboardData) return null;

  const nodeIdMap = new Map<string, string>();
  
  // Create new nodes with updated IDs and positions
  const newNodes: EnhancedNode[] = clipboardData.nodes.map(node => {
    const newId = `${node.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    nodeIdMap.set(node.id, newId);
    
    return {
      ...node,
      id: newId,
      label: `${node.label} (Copy)`,
      x: node.x + offsetX,
      y: node.y + offsetY
    };
  });

  // Create new edges with updated node references
  const newEdges: EnhancedEdge[] = clipboardData.edges.map(edge => {
    const newSource = nodeIdMap.get(edge.source);
    const newTarget = nodeIdMap.get(edge.target);
    
    if (!newSource || !newTarget) return null;
    
    return {
      ...edge,
      id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      source: newSource,
      target: newTarget
    };
  }).filter(Boolean) as EnhancedEdge[];

  return { nodes: newNodes, edges: newEdges };
};

export const clearClipboard = (): void => {
  try {
    localStorage.removeItem(CLIPBOARD_KEY);
    console.log('🗑️ Clipboard cleared');
  } catch (error) {
    console.warn('Failed to clear clipboard:', error);
  }
};

export const hasClipboardData = (): boolean => {
  return getClipboardData() !== null;
};

export const duplicateNode = (node: EnhancedNode, offsetX: number = 50, offsetY: number = 50): EnhancedNode => {
  const newId = `${node.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    ...node,
    id: newId,
    label: `${node.label} (Copy)`,
    x: node.x + offsetX,
    y: node.y + offsetY
  };
};
