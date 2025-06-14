
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, X, FileText, Tag } from 'lucide-react';
import { EnhancedNode } from '../../types/nodeTypes';

interface NodeDocumentationProps {
  selectedNode: EnhancedNode;
  onUpdateNode: (updates: Partial<EnhancedNode>) => void;
  onUpdateConfig: (updates: Partial<EnhancedNode['config']>) => void;
}

const NodeDocumentation: React.FC<NodeDocumentationProps> = ({
  selectedNode,
  onUpdateConfig
}) => {
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (newTag.trim() && !selectedNode.config.metadata.tags.includes(newTag.trim())) {
      const updatedTags = [...selectedNode.config.metadata.tags, newTag.trim()];
      onUpdateConfig({
        metadata: { ...selectedNode.config.metadata, tags: updatedTags }
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = selectedNode.config.metadata.tags.filter(tag => tag !== tagToRemove);
    onUpdateConfig({
      metadata: { ...selectedNode.config.metadata, tags: updatedTags }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <FileText className="w-4 h-4 text-gray-600" />
        <h4 className="text-md font-medium text-gray-700">Documentation</h4>
      </div>
      
      <div>
        <Label htmlFor="node-description" className="text-sm font-medium text-gray-700">
          Description
        </Label>
        <Textarea
          id="node-description"
          value={selectedNode.config.metadata.notes}
          onChange={(e) => onUpdateConfig({
            metadata: { ...selectedNode.config.metadata, notes: e.target.value }
          })}
          className="mt-1"
          placeholder="Describe what this node does, its purpose, and any important details..."
          rows={4}
        />
      </div>

      <div>
        <div className="flex items-center space-x-2 mb-2">
          <Tag className="w-4 h-4 text-gray-600" />
          <Label className="text-sm font-medium text-gray-700">Tags</Label>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedNode.config.metadata.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="flex items-center space-x-1">
              <span>{tag}</span>
              <button
                onClick={() => removeTag(tag)}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>

        <div className="flex space-x-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a tag..."
            className="flex-1"
          />
          <Button size="sm" onClick={addTag} disabled={!newTag.trim()}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <h5 className="text-sm font-medium text-gray-700 mb-2">Quick Info</h5>
        <div className="text-xs text-gray-600 space-y-1">
          <div>Node ID: <code className="bg-white px-1 rounded">{selectedNode.id}</code></div>
          <div>Type: <Badge variant="outline" className="text-xs">{selectedNode.type}</Badge></div>
          <div>Position: ({selectedNode.x}, {selectedNode.y})</div>
          <div>Function: <code className="bg-white px-1 rounded">{selectedNode.function.name}</code></div>
        </div>
      </div>
    </div>
  );
};

export default NodeDocumentation;
