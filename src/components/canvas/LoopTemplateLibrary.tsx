
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RotateCcw, Zap, Users, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { LoopType } from '../../types/edgeTypes';
import { EnhancedNode } from '../../types/nodeTypes';

interface LoopTemplate {
  id: string;
  name: string;
  description: string;
  loopType: LoopType;
  icon: React.ReactNode;
  complexity: 'Simple' | 'Moderate' | 'Advanced';
  useCase: string;
  terminationCondition?: string;
  maxIterations?: number;
  enableHumanInterrupt?: boolean;
}

interface LoopTemplateLibraryProps {
  onApplyTemplate: (template: LoopTemplate, sourceNode: EnhancedNode, targetNode: EnhancedNode) => void;
  sourceNode?: EnhancedNode;
  targetNode?: EnhancedNode;
  isOpen: boolean;
  onClose: () => void;
}

const loopTemplates: LoopTemplate[] = [
  {
    id: 'retry-loop',
    name: 'Retry Loop',
    description: 'Automatically retry failed operations with exponential backoff',
    loopType: 'conditional',
    icon: <RotateCcw className="w-4 h-4" />,
    complexity: 'Simple',
    useCase: 'API calls, file processing, network operations',
    terminationCondition: 'state.get("retry_count", 0) >= 3 or state.get("success", False)',
    maxIterations: 5
  },
  {
    id: 'validation-loop',
    name: 'Validation Loop',
    description: 'Continuously validate and refine output until criteria are met',
    loopType: 'conditional',
    icon: <CheckCircle2 className="w-4 h-4" />,
    complexity: 'Moderate',
    useCase: 'Content generation, data validation, quality assurance',
    terminationCondition: 'state.get("validation_score", 0) >= 0.8',
    maxIterations: 10
  },
  {
    id: 'agent-tool-loop',
    name: 'Agent-Tool Loop',
    description: 'Agent calls tools iteratively until task completion',
    loopType: 'tool-based',
    icon: <Zap className="w-4 h-4" />,
    complexity: 'Advanced',
    useCase: 'Multi-step reasoning, tool chaining, complex problem solving',
    terminationCondition: 'state.get("task_complete", False) or len(state.get("tool_calls", [])) >= 5',
    maxIterations: 20
  },
  {
    id: 'human-approval-loop',
    name: 'Human Approval Loop',
    description: 'Process requires human approval at each iteration',
    loopType: 'human-in-loop',
    icon: <Users className="w-4 h-4" />,
    complexity: 'Moderate',
    useCase: 'Content moderation, financial approvals, quality control',
    enableHumanInterrupt: true,
    maxIterations: 50
  },
  {
    id: 'self-improvement-loop',
    name: 'Self-Improvement Loop',
    description: 'Node processes its own output iteratively to improve quality',
    loopType: 'self-loop',
    icon: <AlertTriangle className="w-4 h-4" />,
    complexity: 'Advanced',
    useCase: 'Code optimization, text refinement, iterative learning',
    terminationCondition: 'state.get("improvement_score", 0) < 0.1',
    maxIterations: 15
  },
  {
    id: 'unconditional-batch',
    name: 'Batch Processing Loop',
    description: 'Process all items in a batch unconditionally',
    loopType: 'unconditional',
    icon: <RotateCcw className="w-4 h-4" />,
    complexity: 'Simple',
    useCase: 'Data processing, batch operations, bulk transformations',
    maxIterations: 100
  }
];

const LoopTemplateLibrary: React.FC<LoopTemplateLibraryProps> = ({
  onApplyTemplate,
  sourceNode,
  targetNode,
  isOpen,
  onClose
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<LoopTemplate | null>(null);

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Simple': return 'bg-green-100 text-green-800';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApplyTemplate = (template: LoopTemplate) => {
    if (sourceNode && targetNode) {
      onApplyTemplate(template, sourceNode, targetNode);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Loop Template Library</h2>
              <p className="text-sm text-gray-600 mt-1">
                Choose a pre-built loop pattern for your workflow
              </p>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        <div className="flex h-96">
          <ScrollArea className="w-1/2 border-r border-gray-200">
            <div className="p-4 space-y-3">
              {loopTemplates.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'ring-2 ring-blue-500 bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {template.icon}
                        <CardTitle className="text-sm">{template.name}</CardTitle>
                      </div>
                      <Badge className={getComplexityColor(template.complexity)}>
                        {template.complexity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-xs">
                      {template.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>

          <div className="w-1/2 p-4">
            {selectedTemplate ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {selectedTemplate.icon}
                  <h3 className="text-lg font-medium">{selectedTemplate.name}</h3>
                  <Badge variant="outline">{selectedTemplate.loopType}</Badge>
                </div>

                <p className="text-sm text-gray-600">{selectedTemplate.description}</p>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Use Case</h4>
                    <p className="text-sm text-gray-600">{selectedTemplate.useCase}</p>
                  </div>

                  {selectedTemplate.terminationCondition && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Termination Condition</h4>
                      <code className="text-xs bg-gray-100 p-2 rounded block">
                        {selectedTemplate.terminationCondition}
                      </code>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Max Iterations:</span>
                      <span className="ml-2">{selectedTemplate.maxIterations || 'Unlimited'}</span>
                    </div>
                    <div>
                      <span className="font-medium">Human Interrupt:</span>
                      <span className="ml-2">{selectedTemplate.enableHumanInterrupt ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => handleApplyTemplate(selectedTemplate)}
                    disabled={!sourceNode || !targetNode}
                    className="w-full"
                  >
                    Apply Template
                  </Button>
                  {(!sourceNode || !targetNode) && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Select source and target nodes to apply template
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a template to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoopTemplateLibrary;
