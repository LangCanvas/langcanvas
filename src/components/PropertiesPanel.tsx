import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';
import { Node } from '../hooks/useNodes';
import { Edge } from '../hooks/useEdges';
import { useNodeProperties } from '../hooks/useNodeProperties';

interface PropertiesPanelProps {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  onUpdateNodeProperties: (nodeId: string, updates: Partial<Node>) => void;
  onUpdateEdgeProperties: (edgeId: string, updates: Partial<Edge>) => void;
  allNodes: Node[];
  nodeOutgoingEdges: Edge[];
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedNode,
  selectedEdge,
  onDeleteNode,
  onDeleteEdge,
  onUpdateNodeProperties,
  onUpdateEdgeProperties,
  allNodes,
  nodeOutgoingEdges
}) => {
  const [localName, setLocalName] = useState('');
  const [localDescription, setLocalDescription] = useState('');
  const [localConditionVariable, setLocalConditionVariable] = useState('');
  const [nameError, setNameError] = useState('');
  const [branchErrors, setBranchErrors] = useState<Record<string, string>>({});

  const { validateNodeName, validateBranchLabel, sanitizeNodeName } = useNodeProperties();

  useEffect(() => {
    if (selectedNode) {
      setLocalName(selectedNode.name);
      setLocalDescription(selectedNode.description || '');
      setLocalConditionVariable(selectedNode.conditionVariable || '');
    }
  }, [selectedNode]);

  useEffect(() => {
    if (selectedEdge) {
      // You might want to load edge properties into local state here
      // For example, if you have an edge label:
      // setLocalEdgeLabel(selectedEdge.label || '');
    }
  }, [selectedEdge]);

  const handleNameChange = (newName: string) => {
    setLocalName(newName);
    if (selectedNode) {
      const validation = validateNodeName(newName, selectedNode.id, allNodes);
      if (validation.valid) {
        setNameError('');
        onUpdateNodeProperties(selectedNode.id, { name: newName });
      } else {
        setNameError(validation.error || '');
      }
    }
  };

  const handleDescriptionChange = (newDescription: string) => {
    setLocalDescription(newDescription);
    if (selectedNode) {
      onUpdateNodeProperties(selectedNode.id, { description: newDescription });
    }
  };

  const handleConditionVariableChange = (newVariable: string) => {
    setLocalConditionVariable(newVariable);
    if (selectedNode) {
      onUpdateNodeProperties(selectedNode.id, { conditionVariable: newVariable });
    }
  };

  const handleBranchLabelChange = (edgeId: string, newLabel: string) => {
    const validation = validateBranchLabel(newLabel, edgeId, nodeOutgoingEdges);
    if (validation.valid) {
      setBranchErrors(prev => ({ ...prev, [edgeId]: '' }));
      onUpdateEdgeProperties(edgeId, { label: newLabel });
    } else {
      setBranchErrors(prev => ({ ...prev, [edgeId]: validation.error || '' }));
    }
  };

  const handleBranchValueChange = (edgeId: string, newValue: string) => {
    onUpdateEdgeProperties(edgeId, { value: newValue });
  };

  const handleDeleteBranch = (edgeId: string) => {
    console.log(`Deleting branch: ${edgeId}`);
    onDeleteEdge(edgeId);
  };

  const handleDeleteNode = () => {
    if (selectedNode) {
      console.log(`Deleting node: ${selectedNode.id}`);
      onDeleteNode(selectedNode.id);
    }
  };

  const getTargetNodeName = (targetId: string) => {
    const targetNode = allNodes.find(node => node.id === targetId);
    return targetNode ? targetNode.name : 'Unknown';
  };

  if (!selectedNode && !selectedEdge) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>Select a node to view its properties</p>
      </div>
    );
  }

  if (selectedNode) {
    const isStartOrEnd = selectedNode.type === 'start' || selectedNode.type === 'end';
    
    return (
      <div className="p-4 space-y-4">
        {/* Node Type */}
        <div>
          <Label className="text-sm font-medium text-gray-700">
            Type: {selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)} Node
          </Label>
        </div>

        {/* Node Name */}
        <div>
          <Label htmlFor="node-name" className="text-sm font-medium text-gray-700">
            Name
          </Label>
          {isStartOrEnd ? (
            <Input
              id="node-name"
              value={localName}
              disabled
              className="mt-1 bg-gray-100"
              style={{ minHeight: '44px' }}
            />
          ) : (
            <div>
              <Input
                id="node-name"
                value={localName}
                onChange={(e) => handleNameChange(e.target.value)}
                className={`mt-1 touch-manipulation ${nameError ? 'border-red-500' : ''}`}
                placeholder="Enter node name"
                style={{ minHeight: '44px' }}
              />
              {nameError && (
                <p className="text-sm text-red-600 mt-1">{nameError}</p>
              )}
            </div>
          )}
        </div>

        {/* Node Description */}
        <div>
          <Label htmlFor="node-description" className="text-sm font-medium text-gray-700">
            Description
          </Label>
          <Textarea
            id="node-description"
            value={localDescription}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            className="mt-1 touch-manipulation"
            placeholder="Enter node description"
            rows={3}
            style={{ minHeight: '88px' }}
          />
        </div>

        {/* Condition Node Specific Fields */}
        {selectedNode.type === 'condition' && (
          <>
            {/* Condition Variable */}
            <div>
              <Label htmlFor="condition-variable" className="text-sm font-medium text-gray-700">
                Condition Variable
              </Label>
              <Input
                id="condition-variable"
                value={localConditionVariable}
                onChange={(e) => handleConditionVariableChange(e.target.value)}
                className="mt-1 touch-manipulation"
                placeholder="e.g., difficulty, user_response"
                style={{ minHeight: '44px' }}
              />
              <p className="text-xs text-gray-500 mt-1">
                The state variable to check for branching decisions
              </p>
            </div>

            {/* Branches */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Branches ({nodeOutgoingEdges.length})
              </Label>
              {nodeOutgoingEdges.length > 0 ? (
                <div className="mt-2 space-y-3">
                  {nodeOutgoingEdges.map((edge, index) => (
                    <div key={edge.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          Branch {index + 1} → {getTargetNodeName(edge.target)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBranch(edge.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 touch-manipulation"
                          style={{ minHeight: '36px', minWidth: '36px' }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs font-medium text-gray-600">
                            Branch Label
                          </Label>
                          <Input
                            value={edge.label || ''}
                            onChange={(e) => handleBranchLabelChange(edge.id, e.target.value)}
                            className={`mt-1 touch-manipulation ${branchErrors[edge.id] ? 'border-red-500' : ''}`}
                            placeholder="e.g., yes, no, error"
                            style={{ minHeight: '36px' }}
                          />
                          {branchErrors[edge.id] && (
                            <p className="text-xs text-red-600 mt-1">{branchErrors[edge.id]}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label className="text-xs font-medium text-gray-600">
                            Branch Value
                          </Label>
                          <Input
                            value={edge.value || ''}
                            onChange={(e) => handleBranchValueChange(edge.id, e.target.value)}
                            className="mt-1 touch-manipulation"
                            placeholder="e.g., easy, hard (optional)"
                            style={{ minHeight: '36px' }}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Leave empty for default branch
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">
                  No branches yet. Connect this node to other nodes to create branches.
                </p>
              )}
            </div>
          </>
        )}

        {/* Delete Node Button */}
        {!isStartOrEnd && (
          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="destructive"
              onClick={handleDeleteNode}
              className="w-full touch-manipulation"
              style={{ minHeight: '44px' }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Node
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (selectedEdge) {
    return (
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Edge Properties</h3>
        <p className="text-sm text-gray-500">
          Connection from {getTargetNodeName(selectedEdge.source)} to {getTargetNodeName(selectedEdge.target)}
        </p>
        {selectedEdge.label && (
          <p className="text-sm text-gray-700 mt-2">
            Label: {selectedEdge.label}
          </p>
        )}
      </div>
    );
  }

  return null;
};

export default PropertiesPanel;
