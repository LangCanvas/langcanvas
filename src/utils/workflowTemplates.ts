
import { EnhancedNode } from '../types/nodeTypes';
import { EnhancedEdge } from '../types/edgeTypes';
import { WorkflowJSON } from '../types/workflowTypes';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  workflow: WorkflowJSON;
  preview?: string;
  estimatedTime?: string;
}

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'simple-api-workflow',
    name: 'Simple API Workflow',
    description: 'Basic workflow that calls an API and processes the response',
    category: 'API Integration',
    difficulty: 'beginner',
    tags: ['api', 'http', 'basic', 'starter'],
    estimatedTime: '5 minutes',
    workflow: {
      nodes: [
        {
          id: 'start-1',
          label: 'Start',
          type: 'start',
          position: { x: 100, y: 100 },
          function: {
            name: 'workflow_start',
            input_schema: {},
            output_schema: { trigger: 'string' }
          },
          config: {
            timeout: 30,
            retry: { enabled: false, max_attempts: 1, delay: 1000 },
            concurrency: 'sequential',
            metadata: { tags: [], notes: 'Workflow entry point' }
          },
          transitions: {
            default: 'api-call',
            conditions: []
          }
        },
        {
          id: 'api-call-1',
          label: 'API Call',
          type: 'function',
          position: { x: 300, y: 100 },
          function: {
            name: 'http_request',
            input_schema: {
              url: 'string',
              method: 'string',
              headers: 'object'
            },
            output_schema: {
              response: 'object',
              status: 'number'
            }
          },
          config: {
            timeout: 30,
            retry: { enabled: true, max_attempts: 3, delay: 1000 },
            concurrency: 'sequential',
            metadata: { tags: ['api'], notes: 'Makes HTTP request to external API' }
          },
          transitions: {
            default: 'end',
            conditions: []
          }
        },
        {
          id: 'end-1',
          label: 'End',
          type: 'end',
          position: { x: 500, y: 100 },
          function: {
            name: 'workflow_end',
            input_schema: { result: 'object' },
            output_schema: {}
          },
          config: {
            timeout: 30,
            retry: { enabled: false, max_attempts: 1, delay: 1000 },
            concurrency: 'sequential',
            metadata: { tags: [], notes: 'Workflow completion' }
          },
          transitions: {
            default: '',
            conditions: []
          }
        }
      ],
      edges: [
        {
          id: 'edge-1',
          source: 'Start',
          target: 'API Call',
          label: 'proceed'
        },
        {
          id: 'edge-2',
          source: 'API Call',
          target: 'End',
          label: 'complete'
        }
      ],
      entryPoint: 'API Call',
      version: '1.0'
    }
  },
  {
    id: 'conditional-processing',
    name: 'Conditional Data Processing',
    description: 'Workflow with conditional branching based on data validation',
    category: 'Data Processing',
    difficulty: 'intermediate',
    tags: ['conditional', 'data', 'validation', 'branching'],
    estimatedTime: '10 minutes',
    workflow: {
      nodes: [
        {
          id: 'start-2',
          label: 'Start',
          type: 'start',
          position: { x: 100, y: 200 },
          function: {
            name: 'workflow_start',
            input_schema: {},
            output_schema: { data: 'object' }
          },
          config: {
            timeout: 30,
            retry: { enabled: false, max_attempts: 1, delay: 1000 },
            concurrency: 'sequential',
            metadata: { tags: [], notes: 'Receives input data' }
          },
          transitions: {
            default: 'validate-data',
            conditions: []
          }
        },
        {
          id: 'validate-data',
          label: 'Validate Data',
          type: 'function',
          position: { x: 300, y: 200 },
          function: {
            name: 'validate_input',
            input_schema: { data: 'object' },
            output_schema: { valid: 'boolean', errors: 'array' }
          },
          config: {
            timeout: 30,
            retry: { enabled: true, max_attempts: 2, delay: 1000 },
            concurrency: 'sequential',
            metadata: { tags: ['validation'], notes: 'Validates input data structure' }
          },
          transitions: {
            default: 'check-validity',
            conditions: []
          }
        },
        {
          id: 'check-validity',
          label: 'Check Validity',
          type: 'conditional',
          position: { x: 500, y: 200 },
          function: {
            name: 'condition_check',
            input_schema: { valid: 'boolean' },
            output_schema: { branch: 'string' }
          },
          config: {
            timeout: 30,
            retry: { enabled: false, max_attempts: 1, delay: 1000 },
            concurrency: 'sequential',
            conditional: { evaluationMode: 'first-match' },
            metadata: { tags: ['condition'], notes: 'Routes based on validation result' }
          },
          transitions: {
            default: 'handle-error',
            conditions: [
              { expression: 'valid == true', next_node: 'process-data' },
              { expression: 'valid == false', next_node: 'handle-error' }
            ]
          }
        },
        {
          id: 'process-data',
          label: 'Process Data',
          type: 'function',
          position: { x: 700, y: 150 },
          function: {
            name: 'process_valid_data',
            input_schema: { data: 'object' },
            output_schema: { processed: 'object' }
          },
          config: {
            timeout: 60,
            retry: { enabled: true, max_attempts: 3, delay: 2000 },
            concurrency: 'sequential',
            metadata: { tags: ['processing'], notes: 'Processes valid data' }
          },
          transitions: {
            default: 'success-end',
            conditions: []
          }
        },
        {
          id: 'handle-error',
          label: 'Handle Error',
          type: 'function',
          position: { x: 700, y: 250 },
          function: {
            name: 'handle_validation_error',
            input_schema: { errors: 'array' },
            output_schema: { error_report: 'object' }
          },
          config: {
            timeout: 30,
            retry: { enabled: false, max_attempts: 1, delay: 1000 },
            concurrency: 'sequential',
            metadata: { tags: ['error'], notes: 'Handles validation errors' }
          },
          transitions: {
            default: 'error-end',
            conditions: []
          }
        },
        {
          id: 'success-end',
          label: 'Success',
          type: 'end',
          position: { x: 900, y: 150 },
          function: {
            name: 'workflow_success',
            input_schema: { processed: 'object' },
            output_schema: {}
          },
          config: {
            timeout: 30,
            retry: { enabled: false, max_attempts: 1, delay: 1000 },
            concurrency: 'sequential',
            metadata: { tags: [], notes: 'Successful completion' }
          },
          transitions: {
            default: '',
            conditions: []
          }
        },
        {
          id: 'error-end',
          label: 'Error End',
          type: 'end',
          position: { x: 900, y: 250 },
          function: {
            name: 'workflow_error',
            input_schema: { error_report: 'object' },
            output_schema: {}
          },
          config: {
            timeout: 30,
            retry: { enabled: false, max_attempts: 1, delay: 1000 },
            concurrency: 'sequential',
            metadata: { tags: [], notes: 'Error completion' }
          },
          transitions: {
            default: '',
            conditions: []
          }
        }
      ],
      edges: [
        {
          id: 'edge-3',
          source: 'Start',
          target: 'Validate Data',
          label: 'input'
        },
        {
          id: 'edge-4',
          source: 'Validate Data',
          target: 'Check Validity',
          label: 'validation_result'
        },
        {
          id: 'edge-5',
          source: 'Check Validity',
          target: 'Process Data',
          label: 'valid',
          conditional: {
            condition: {
              expression: 'valid == true',
              functionName: 'is_valid',
              parameters: {}
            },
            priority: 1,
            isDefault: false
          }
        },
        {
          id: 'edge-6',
          source: 'Check Validity',
          target: 'Handle Error',
          label: 'invalid',
          conditional: {
            condition: {
              expression: 'valid == false',
              functionName: 'is_invalid',
              parameters: {}
            },
            priority: 2,
            isDefault: true
          }
        },
        {
          id: 'edge-7',
          source: 'Process Data',
          target: 'Success',
          label: 'processed'
        },
        {
          id: 'edge-8',
          source: 'Handle Error',
          target: 'Error End',
          label: 'error_handled'
        }
      ],
      entryPoint: 'Validate Data',
      version: '1.0'
    }
  }
];

export const getTemplatesByCategory = (category?: string): WorkflowTemplate[] => {
  if (!category) return workflowTemplates;
  return workflowTemplates.filter(template => template.category === category);
};

export const getTemplatesByDifficulty = (difficulty: WorkflowTemplate['difficulty']): WorkflowTemplate[] => {
  return workflowTemplates.filter(template => template.difficulty === difficulty);
};

export const searchWorkflowTemplates = (query: string): WorkflowTemplate[] => {
  const lowerQuery = query.toLowerCase();
  return workflowTemplates.filter(template =>
    template.name.toLowerCase().includes(lowerQuery) ||
    template.description.toLowerCase().includes(lowerQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    template.category.toLowerCase().includes(lowerQuery)
  );
};

export const getTemplateCategories = (): string[] => {
  return Array.from(new Set(workflowTemplates.map(template => template.category)));
};
