
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { EnhancedNode } from '../../types/nodeTypes';

interface InputSchemaEditorProps {
  selectedNode: EnhancedNode;
  onUpdateFunction: (updates: Partial<EnhancedNode['function']>) => void;
}

const InputSchemaEditor: React.FC<InputSchemaEditorProps> = ({
  selectedNode,
  onUpdateFunction
}) => {
  const addInputParam = () => {
    const newSchema = { ...selectedNode.function.input_schema, [`param${Object.keys(selectedNode.function.input_schema).length + 1}`]: 'string' };
    onUpdateFunction({ input_schema: newSchema });
  };

  const removeInputParam = (key: string) => {
    const newSchema = { ...selectedNode.function.input_schema };
    delete newSchema[key];
    onUpdateFunction({ input_schema: newSchema });
  };

  const updateInputParam = (oldKey: string, newKey: string, type: string) => {
    const newSchema = { ...selectedNode.function.input_schema };
    delete newSchema[oldKey];
    newSchema[newKey] = type;
    onUpdateFunction({ input_schema: newSchema });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-medium text-gray-700">Input Schema</h4>
        <Button size="sm" variant="outline" onClick={addInputParam}>
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>
      
      <div className="space-y-3">
        {Object.entries(selectedNode.function.input_schema).map(([key, type]) => (
          <div key={key} className="flex items-center space-x-2">
            <Input
              value={key}
              onChange={(e) => updateInputParam(key, e.target.value, type)}
              placeholder="Parameter name"
              className="flex-1"
            />
            <Select value={type} onValueChange={(newType) => updateInputParam(key, key, newType)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="string">String</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
                <SelectItem value="object">Object</SelectItem>
                <SelectItem value="array">Array</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="ghost" onClick={() => removeInputParam(key)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InputSchemaEditor;
