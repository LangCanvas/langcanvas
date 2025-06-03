
import React, { useState, useEffect } from 'react';
import { Code, Trash2, ArrowRight, Plus, X } from 'lucide-react';
import { Node } from '../hooks/useNodes';
import { Edge } from '../hooks/useEdges';
import { useNodeProperties } from '../hooks/useNodeProperties';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface PropertiesPanelProps {
  selectedNode?: Node;
  selectedEdge?: Edge;
  className?: string;
  onDeleteNode?: (id: string) => void;
  onDeleteEdge?: (id: string) => void;
  onUpdateNodeProperties?: (id: string, updates: Partial<Node>) => void;
  onUpdateEdgeProperties?: (id: string, updates: Partial<Edge>) => void;
  allNodes?: Node[];
  nodeOutgoingEdges?: Edge[];
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ 
  selectedNode, 
  selectedEdge, 
  className, 
  onDeleteNode, 
  onDeleteEdge,
  onUpdateNodeProperties,
  onUpdateEdgeProperties,
  allNodes = [],
  nodeOutgoingEdges = []
}) => {
  const [editingName, setEditingName] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [editingConditionVariable, setEditingConditionVariable] = useState('');
  const [nameError, setNameError] = useState('');
  const [branchErrors, setBranchErrors] = useState<{[key: string]: string}>({});
  
  const { validateNodeName, validateBranchLabel } = useNodeProperties();

  useEffect(() => {
    if (selectedNode) {
      setEditingName(selectedNode.name);
      setEditingDescription(selectedNode.description || '');
      setEditingConditionVariable(selectedNode.conditionVariable || '');
      setNameError('');
      setBranchErrors({});
    }
  }, [selectedNode]);

  const handleNameChange = (newName: string) => {
    setEditingName(newName);
    setNameError('');
  };

  const handleNameBlur = () => {
    if (!selectedNode || !onUpdateNodeProperties) return;

    const trimmedName = editingName.trim();
    
    // Don't allow renaming Start and End nodes
    if (selectedNode.type === 'start' || selectedNode.type === 'end') {
      setEditingName(selectedNode.name);
      return;
    }

    const validation = validateNodeName(trimmedName, selectedNode.id, allNodes);
    
    if (!validation.valid) {
      setNameError(validation.error || 'Invalid name');
      setEditingName(selectedNode.name); // Revert
      return;
    }

    if (trimmedName !== selectedNode.name) {
      onUpdateNodeProperties(selectedNode.id, { name: trimmedName });
    }
  };

  const handleDescriptionBlur = () => {
    if (!selectedNode || !onUpdateNodeProperties) return;
    
    if (editingDescription !== (selectedNode.description || '')) {
      onUpdateNodeProperties(selectedNode.id, { description: editingDescription });
    }
  };

  const handleConditionVariableBlur = () => {
    if (!selectedNode || !onUpdateNodeProperties) return;
    
    if (editingConditionVariable !== (selectedNode.conditionVariable || '')) {
      onUpdateNodeProperties(selectedNode.id, { conditionVariable: editingConditionVariable });
    }
  };

  const handleBranchLabelChange = (edgeId: string, newLabel: string) => {
    if (!onUpdateEdgeProperties) return;

    const validation = validateBranchLabel(newLabel, edgeId, nodeOutgoingEdges);
    
    if (!validation.valid) {
      setBranchErrors(prev => ({ ...prev, [edgeId]: validation.error || 'Invalid label' }));
      return;
    }

    setBranchErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[edgeId];
      return newErrors;
    });

    onUpdateEdgeProperties(edgeId, { label: newLabel });
  };

  const handleBranchValueChange = (edgeId: string, newValue: string) => {
    if (!onUpdateEdgeProperties) return;
    onUpdateEdgeProperties(edgeId, { value: newValue });
  };

  const handleDeleteBranch = (edgeId: string) => {
    if (onDeleteEdge) {
      onDeleteEdge(edgeId);
    }
  };

  if (!selectedNode && !selectedEdge) {
    return (
      <div className={`flex-1 p-4 ${className}`}>
        <div className="flex items-center justify-center h-full text-center text-gray-400">
          <div>
            <div className="mb-2">
              <Code className="w-8 h-8 mx-auto mb-3 opacity-30" />
            </div>
            <p className="text-sm">Select a node or edge to edit its properties</p>
          </div>
        </div>
      </div>
    );
  }

  const getNodeTypeDisplayName = (type: string) => {
    switch (type) {
      case 'start': return 'Start Node';
      case 'tool': return 'Tool Node';
      case 'condition': return 'Condition Node';
      case 'end': return 'End Node';
      default: return 'Unknown Node';
    }
  };

  if (selectedEdge) {
    return (
      <div className={`flex-1 p-4 ${className}`}>
        <div className="space-y-4">
          <div className="pb-2 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700">Edge Properties</h3>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1">
              Connection
            </Label>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded border">
              <span className="truncate">{selectedEdge.source}</span>
              <ArrowRight className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{selectedEdge.target}</span>
            </div>
          </div>

          {selectedEdge.label && (
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1">
                Branch Label
              </Label>
              <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded border">
                {selectedEdge.label}
              </p>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1">
              Edge ID
            </Label>
            <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded border font-mono text-xs">
              {selectedEdge.id}
            </p>
          </div>

          {onDeleteEdge && (
            <div className="pt-4 border-t border-gray-200">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDeleteEdge(selectedEdge.id)}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Edge
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                You can also press Delete key to remove the selected edge
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const isNameEditable = selectedNode!.type !== 'start' && selectedNode!.type !== 'end';

  return (
    <div className={`flex-1 p-4 ${className}`}>
      <div className="space-y-4">
        <div className="pb-2 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700">Node Properties</h3>
        </div>
        
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-1">
            Node Type
          </Label>
          <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded border">
            {getNodeTypeDisplayName(selectedNode!.type)}
          </p>
        </div>
        
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-1">
            Name
          </Label>
          <Input
            type="text"
            value={editingName}
            onChange={(e) => handleNameChange(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            placeholder="Enter node name"
            readOnly={!isNameEditable}
            className={`${!isNameEditable ? 'bg-gray-50' : ''} ${nameError ? 'border-red-500' : ''}`}
            title={!isNameEditable ? "Start and End node names cannot be changed" : ""}
          />
          {nameError && (
            <p className="text-xs text-red-500 mt-1">{nameError}</p>
          )}
        </div>
        
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-1">
            Position
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="block text-xs text-gray-500 mb-1">X</Label>
              <Input
                type="number"
                className="text-sm bg-gray-50"
                value={Math.round(selectedNode!.x)}
                readOnly
              />
            </div>
            <div>
              <Label className="block text-xs text-gray-500 mb-1">Y</Label>
              <Input
                type="number"
                className="text-sm bg-gray-50"
                value={Math.round(selectedNode!.y)}
                readOnly
              />
            </div>
          </div>
        </div>
        
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-1">
            Description
          </Label>
          <Textarea
            value={editingDescription}
            onChange={(e) => setEditingDescription(e.target.value)}
            onBlur={handleDescriptionBlur}
            rows={3}
            placeholder="Optional description or notes about this node"
            className="resize-none"
          />
        </div>

        {selectedNode!.type === 'condition' && (
          <>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1">
                Condition Variable
              </Label>
              <Input
                type="text"
                value={editingConditionVariable}
                onChange={(e) => setEditingConditionVariable(e.target.value)}
                onBlur={handleConditionVariableBlur}
                placeholder="e.g., difficulty, user_response"
                title="State variable or key to evaluate for branching decisions"
              />
              <p className="text-xs text-gray-500 mt-1">
                State variable to check for branching logic
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Branches ({nodeOutgoingEdges.length})
              </Label>
              
              {nodeOutgoingEdges.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  No outgoing connections. Draw connections from this node to create branches.
                </p>
              ) : (
                <div className="space-y-2">
                  {nodeOutgoingEdges.map((edge) => {
                    const targetNode = allNodes.find(n => n.id === edge.target);
                    return (
                      <div key={edge.id} className="border rounded p-3 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">Branch to: {targetNode?.name || 'Unknown'}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBranch(edge.id)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs text-gray-600 mb-1 block">Branch Label</Label>
                            <Input
                              type="text"
                              value={edge.label || ''}
                              onChange={(e) => handleBranchLabelChange(edge.id, e.target.value)}
                              placeholder="e.g., Yes, No, Easy"
                              className={`text-sm ${branchErrors[edge.id] ? 'border-red-500' : ''}`}
                            />
                            {branchErrors[edge.id] && (
                              <p className="text-xs text-red-500 mt-1">{branchErrors[edge.id]}</p>
                            )}
                          </div>
                          
                          <div>
                            <Label className="text-xs text-gray-600 mb-1 block">Condition Value</Label>
                            <Input
                              type="text"
                              value={edge.value || ''}
                              onChange={(e) => handleBranchValueChange(edge.id, e.target.value)}
                              placeholder="e.g., easy, yes, 5 (leave empty for default)"
                              className="text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-2">
                Draw new connections from this node to add more branches. 
                One branch can be left without a condition value to serve as the default case.
              </p>
            </div>
          </>
        )}

        {onDeleteNode && (
          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDeleteNode(selectedNode!.id)}
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Node
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              You can also press Delete key to remove the selected node
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;
