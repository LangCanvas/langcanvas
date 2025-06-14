
import { NodeType } from '../types/nodeTypes';

export interface NodeCategory {
  id: string;
  label: string;
  description: string;
  icon: string;
  nodes: NodeDefinition[];
}

export interface NodeDefinition {
  type: NodeType;
  label: string;
  description: string;
  icon: string;
  color: string;
  tags: string[];
  template?: any;
}

export const nodeDefinitions: NodeDefinition[] = [
  {
    type: 'start',
    label: 'Start',
    description: 'Entry point of the workflow',
    icon: '▶',
    color: 'bg-green-100 border-green-300 text-green-800',
    tags: ['entry', 'begin', 'trigger']
  },
  {
    type: 'end',
    label: 'End',
    description: 'Exit point of the workflow',
    icon: '⏹',
    color: 'bg-red-100 border-red-300 text-red-800',
    tags: ['exit', 'finish', 'terminate']
  },
  {
    type: 'agent',
    label: 'Agent',
    description: 'AI agent that can reason and make decisions',
    icon: '🤖',
    color: 'bg-green-100 border-green-300 text-green-800',
    tags: ['ai', 'llm', 'reasoning', 'intelligence']
  },
  {
    type: 'tool',
    label: 'Tool',
    description: 'External tool or API integration',
    icon: '🔧',
    color: 'bg-blue-100 border-blue-300 text-blue-800',
    tags: ['api', 'external', 'integration', 'service']
  },
  {
    type: 'function',
    label: 'Function',
    description: 'Custom code execution block',
    icon: 'ƒ',
    color: 'bg-purple-100 border-purple-300 text-purple-800',
    tags: ['code', 'custom', 'logic', 'computation']
  },
  {
    type: 'conditional',
    label: 'Conditional',
    description: 'Decision point based on conditions',
    icon: '◆',
    color: 'bg-orange-100 border-orange-300 text-orange-800',
    tags: ['decision', 'branch', 'if', 'condition']
  },
  {
    type: 'parallel',
    label: 'Parallel',
    description: 'Execute multiple paths simultaneously',
    icon: '∥',
    color: 'bg-cyan-100 border-cyan-300 text-cyan-800',
    tags: ['concurrent', 'parallel', 'async', 'multi']
  }
];

export const nodeCategories: NodeCategory[] = [
  {
    id: 'flow',
    label: 'Flow Control',
    description: 'Control the flow of execution',
    icon: '🔄',
    nodes: nodeDefinitions.filter(node => ['start', 'end', 'conditional', 'parallel'].includes(node.type))
  },
  {
    id: 'processing',
    label: 'Processing',
    description: 'Data processing and computation',
    icon: '⚙️',
    nodes: nodeDefinitions.filter(node => ['agent', 'function'].includes(node.type))
  },
  {
    id: 'integration',
    label: 'Integration',
    description: 'External services and APIs',
    icon: '🔗',
    nodes: nodeDefinitions.filter(node => ['tool'].includes(node.type))
  }
];

export const getAllNodes = (): NodeDefinition[] => nodeDefinitions;

export const getNodesByCategory = (categoryId: string): NodeDefinition[] => {
  const category = nodeCategories.find(cat => cat.id === categoryId);
  return category ? category.nodes : [];
};

export const searchNodes = (query: string): NodeDefinition[] => {
  const lowercaseQuery = query.toLowerCase();
  return nodeDefinitions.filter(node => 
    node.label.toLowerCase().includes(lowercaseQuery) ||
    node.description.toLowerCase().includes(lowercaseQuery) ||
    node.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};
