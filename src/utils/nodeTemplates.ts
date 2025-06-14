
import { NodeType, EnhancedNode } from '../types/nodeTypes';
import { createDefaultNode } from './nodeDefaults';

export interface NodeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodeType: NodeType;
  config: Partial<EnhancedNode>;
  tags: string[];
}

export const nodeTemplates: NodeTemplate[] = [
  {
    id: 'http-api-call',
    name: 'HTTP API Call',
    description: 'Make HTTP requests to external APIs',
    category: 'Integration',
    nodeType: 'function',
    config: {
      function: {
        name: 'http_request',
        input_schema: {
          url: 'string',
          method: 'string',
          headers: 'object',
          data: 'object'
        },
        output_schema: {
          response: 'object',
          status: 'number',
          headers: 'object'
        }
      },
      config: {
        metadata: {
          notes: 'Performs HTTP requests with configurable method, headers, and data'
        }
      }
    },
    tags: ['http', 'api', 'integration', 'web']
  },
  {
    id: 'data-transformation',
    name: 'Data Transformation',
    description: 'Transform and manipulate data structures',
    category: 'Processing',
    nodeType: 'function',
    config: {
      function: {
        name: 'transform_data',
        input_schema: {
          data: 'object',
          transformation_rules: 'object'
        },
        output_schema: {
          transformed_data: 'object'
        }
      },
      config: {
        metadata: {
          notes: 'Applies transformation rules to input data'
        }
      }
    },
    tags: ['data', 'transform', 'processing', 'etl']
  },
  {
    id: 'conditional-branch',
    name: 'Conditional Branch',
    description: 'Route workflow based on conditions',
    category: 'Control Flow',
    nodeType: 'conditional',
    config: {
      config: {
        conditional: {
          evaluationMode: 'first-match'
        },
        metadata: {
          notes: 'Evaluates conditions and routes to appropriate branch'
        }
      }
    },
    tags: ['condition', 'branch', 'control', 'logic']
  },
  {
    id: 'parallel-execution',
    name: 'Parallel Execution',
    description: 'Execute multiple branches in parallel',
    category: 'Control Flow',
    nodeType: 'parallel',
    config: {
      config: {
        concurrency: 'parallel',
        metadata: {
          notes: 'Executes multiple workflow branches simultaneously'
        }
      }
    },
    tags: ['parallel', 'concurrent', 'performance', 'control']
  },
  {
    id: 'email-notification',
    name: 'Email Notification',
    description: 'Send email notifications',
    category: 'Communication',
    nodeType: 'function',
    config: {
      function: {
        name: 'send_email',
        input_schema: {
          to: 'string',
          subject: 'string',
          body: 'string',
          cc: 'string',
          bcc: 'string'
        },
        output_schema: {
          success: 'boolean',
          message_id: 'string'
        }
      },
      config: {
        metadata: {
          notes: 'Sends email notifications with configurable recipients and content'
        }
      }
    },
    tags: ['email', 'notification', 'communication', 'alert']
  }
];

export const getTemplatesByCategory = (category?: string): NodeTemplate[] => {
  if (!category) return nodeTemplates;
  return nodeTemplates.filter(template => template.category === category);
};

export const getTemplatesByNodeType = (nodeType: NodeType): NodeTemplate[] => {
  return nodeTemplates.filter(template => template.nodeType === nodeType);
};

export const searchTemplates = (query: string): NodeTemplate[] => {
  const lowerQuery = query.toLowerCase();
  return nodeTemplates.filter(template =>
    template.name.toLowerCase().includes(lowerQuery) ||
    template.description.toLowerCase().includes(lowerQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

export const getTemplateCategories = (): string[] => {
  return Array.from(new Set(nodeTemplates.map(template => template.category)));
};

export const createNodeFromTemplate = (
  templateId: string,
  x: number,
  y: number
): EnhancedNode | null => {
  const template = nodeTemplates.find(t => t.id === templateId);
  if (!template) return null;

  const id = `${template.nodeType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const baseNode = createDefaultNode(id, template.nodeType, x, y);
  
  // Apply template configuration
  return {
    ...baseNode,
    label: template.name,
    ...template.config
  };
};
