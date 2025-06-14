
import { WorkflowJSON } from '../types/workflowTypes';
import { EnhancedNode, NodeType } from '../types/nodeTypes';
import { EnhancedEdge } from '../types/edgeTypes';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  nodes: EnhancedNode[];
  edges: EnhancedEdge[];
  metadata: {
    created: string;
    version: string;
    author: string;
    complexity: 'beginner' | 'intermediate' | 'advanced';
  };
}

const createNode = (
  id: string,
  type: NodeType,
  label: string,
  x: number,
  y: number,
  functionName?: string
): EnhancedNode => ({
  id,
  type,
  label,
  x,
  y,
  function: {
    name: functionName || `${type}_function`,
    input_schema: {},
    output_schema: {}
  },
  config: {
    timeout: 30,
    retry: {
      enabled: false,
      max_attempts: 3,
      delay: 1000
    },
    concurrency: 'sequential',
    metadata: {
      tags: [],
      notes: ''
    }
  },
  transitions: {
    default: '',
    conditions: []
  }
});

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'simple-api-workflow',
    name: 'Simple API Workflow',
    description: 'Basic workflow that makes an API call and processes the response',
    category: 'Integration',
    tags: ['api', 'basic', 'http'],
    nodes: [
      createNode('start-1', 'start', 'Start', 100, 100),
      createNode('api-call-1', 'function', 'API Call', 300, 100, 'make_api_call'),
      createNode('process-data-1', 'function', 'Process Data', 500, 100, 'process_response'),
      createNode('end-1', 'end', 'End', 700, 100)
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'start-1',
        target: 'api-call-1'
      },
      {
        id: 'edge-2',
        source: 'api-call-1',
        target: 'process-data-1'
      },
      {
        id: 'edge-3',
        source: 'process-data-1',
        target: 'end-1'
      }
    ],
    metadata: {
      created: '2024-01-01',
      version: '1.0.0',
      author: 'System',
      complexity: 'beginner'
    }
  },
  {
    id: 'conditional-workflow',
    name: 'Conditional Processing Workflow',
    description: 'Workflow with conditional branching based on data validation',
    category: 'Control Flow',
    tags: ['conditional', 'branching', 'validation'],
    nodes: [
      createNode('start-2', 'start', 'Start', 100, 200),
      createNode('validate-2', 'function', 'Validate Input', 300, 200, 'validate_input'),
      createNode('condition-2', 'conditional', 'Check Valid', 500, 200),
      createNode('process-valid-2', 'function', 'Process Valid', 700, 150, 'process_valid_data'),
      createNode('handle-error-2', 'function', 'Handle Error', 700, 250, 'handle_error'),
      createNode('end-2', 'end', 'End', 900, 200)
    ],
    edges: [
      {
        id: 'edge-4',
        source: 'start-2',
        target: 'validate-2'
      },
      {
        id: 'edge-5',
        source: 'validate-2',
        target: 'condition-2'
      },
      {
        id: 'edge-6',
        source: 'condition-2',
        target: 'process-valid-2',
        conditional: {
          condition: {
            functionName: 'is_valid',
            expression: 'data.valid == true',
            priority: 1,
            isDefault: false
          },
          sourceNodeType: 'conditional',
          evaluationMode: 'first-match'
        }
      },
      {
        id: 'edge-7',
        source: 'condition-2',
        target: 'handle-error-2',
        conditional: {
          condition: {
            functionName: 'is_invalid',
            expression: 'data.valid == false',
            priority: 2,
            isDefault: true
          },
          sourceNodeType: 'conditional',
          evaluationMode: 'first-match'
        }
      },
      {
        id: 'edge-8',
        source: 'process-valid-2',
        target: 'end-2'
      },
      {
        id: 'edge-9',
        source: 'handle-error-2',
        target: 'end-2'
      }
    ],
    metadata: {
      created: '2024-01-01',
      version: '1.0.0',
      author: 'System',
      complexity: 'intermediate'
    }
  },
  {
    id: 'parallel-processing-workflow',
    name: 'Parallel Processing Workflow',
    description: 'Workflow that processes data in parallel branches',
    category: 'Performance',
    tags: ['parallel', 'performance', 'concurrent'],
    nodes: [
      createNode('start-3', 'start', 'Start', 100, 300),
      createNode('split-3', 'parallel', 'Split Data', 300, 300),
      createNode('process-a-3', 'function', 'Process A', 500, 250, 'process_branch_a'),
      createNode('process-b-3', 'function', 'Process B', 500, 350, 'process_branch_b'),
      createNode('merge-3', 'function', 'Merge Results', 700, 300, 'merge_results'),
      createNode('end-3', 'end', 'End', 900, 300)
    ],
    edges: [
      {
        id: 'edge-10',
        source: 'start-3',
        target: 'split-3'
      },
      {
        id: 'edge-11',
        source: 'split-3',
        target: 'process-a-3'
      },
      {
        id: 'edge-12',
        source: 'split-3',
        target: 'process-b-3'
      },
      {
        id: 'edge-13',
        source: 'process-a-3',
        target: 'merge-3'
      },
      {
        id: 'edge-14',
        source: 'process-b-3',
        target: 'merge-3'
      },
      {
        id: 'edge-15',
        source: 'merge-3',
        target: 'end-3'
      }
    ],
    metadata: {
      created: '2024-01-01',
      version: '1.0.0',
      author: 'System',
      complexity: 'advanced'
    }
  }
];

export const getTemplatesByCategory = (category?: string): WorkflowTemplate[] => {
  if (!category) return workflowTemplates;
  return workflowTemplates.filter(template => template.category === category);
};

export const getTemplatesByComplexity = (complexity: 'beginner' | 'intermediate' | 'advanced'): WorkflowTemplate[] => {
  return workflowTemplates.filter(template => template.metadata.complexity === complexity);
};

export const searchWorkflowTemplates = (query: string): WorkflowTemplate[] => {
  const lowerQuery = query.toLowerCase();
  return workflowTemplates.filter(template =>
    template.name.toLowerCase().includes(lowerQuery) ||
    template.description.toLowerCase().includes(lowerQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

export const getTemplateCategories = (): string[] => {
  return Array.from(new Set(workflowTemplates.map(template => template.category)));
};

export const createWorkflowFromTemplate = (templateId: string): { nodes: EnhancedNode[]; edges: EnhancedEdge[] } | null => {
  const template = workflowTemplates.find(t => t.id === templateId);
  if (!template) return null;

  // Create new IDs for nodes and update edge references
  const nodeIdMap = new Map<string, string>();
  
  const newNodes = template.nodes.map(node => {
    const newId = `${node.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    nodeIdMap.set(node.id, newId);
    
    return {
      ...node,
      id: newId
    };
  });

  const newEdges = template.edges.map(edge => {
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
