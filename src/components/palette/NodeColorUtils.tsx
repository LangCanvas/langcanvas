
import { NodeType } from '../../types/nodeTypes';

export const getEnhancedNodeColors = (nodeType: NodeType): string => {
  switch (nodeType) {
    case 'start':
      return 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100 hover:border-green-300';
    case 'agent':
      return 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-300';
    case 'tool':
      return 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100 hover:border-blue-300';
    case 'function':
      return 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100 hover:border-purple-300';
    case 'conditional':
      return 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 hover:border-amber-300';
    case 'parallel':
      return 'bg-cyan-50 border-cyan-200 text-cyan-800 hover:bg-cyan-100 hover:border-cyan-300';
    case 'end':
      return 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100 hover:border-red-300';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100 hover:border-gray-300';
  }
};
