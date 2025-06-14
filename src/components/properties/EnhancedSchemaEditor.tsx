
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Code, AlertCircle } from 'lucide-react';
import { EnhancedNode } from '../../types/nodeTypes';

interface EnhancedSchemaEditorProps {
  selectedNode: EnhancedNode;
  onUpdateFunction: (updates: Partial<EnhancedNode['function']>) => void;
}

interface SchemaField {
  name: string;
  type: string;
  required: boolean;
  description: string;
  defaultValue?: string;
}

const EnhancedSchemaEditor: React.FC<EnhancedSchemaEditorProps> = ({
  selectedNode,
  onUpdateFunction
}) => {
  const [activeTab, setActiveTab] = useState<'input' | 'output'>('input');
  const [schemaMode, setSchemaMode] = useState<'visual' | 'json'>('visual');

  const convertSchemaToFields = (schema: Record<string, string>): SchemaField[] => {
    return Object.entries(schema).map(([name, type]) => ({
      name,
      type,
      required: true,
      description: ''
    }));
  };

  const convertFieldsToSchema = (fields: SchemaField[]): Record<string, string> => {
    return fields.reduce((acc, field) => {
      acc[field.name] = field.type;
      return acc;
    }, {} as Record<string, string>);
  };

  const [inputFields, setInputFields] = useState<SchemaField[]>(
    convertSchemaToFields(selectedNode.function.input_schema)
  );
  
  const [outputFields, setOutputFields] = useState<SchemaField[]>(
    convertSchemaToFields(selectedNode.function.output_schema)
  );

  const addField = (isInput: boolean) => {
    const newField: SchemaField = {
      name: `field${isInput ? inputFields.length + 1 : outputFields.length + 1}`,
      type: 'string',
      required: true,
      description: ''
    };

    if (isInput) {
      const newFields = [...inputFields, newField];
      setInputFields(newFields);
      onUpdateFunction({ input_schema: convertFieldsToSchema(newFields) });
    } else {
      const newFields = [...outputFields, newField];
      setOutputFields(newFields);
      onUpdateFunction({ output_schema: convertFieldsToSchema(newFields) });
    }
  };

  const updateField = (index: number, updates: Partial<SchemaField>, isInput: boolean) => {
    if (isInput) {
      const newFields = [...inputFields];
      newFields[index] = { ...newFields[index], ...updates };
      setInputFields(newFields);
      onUpdateFunction({ input_schema: convertFieldsToSchema(newFields) });
    } else {
      const newFields = [...outputFields];
      newFields[index] = { ...newFields[index], ...updates };
      setOutputFields(newFields);
      onUpdateFunction({ output_schema: convertFieldsToSchema(newFields) });
    }
  };

  const removeField = (index: number, isInput: boolean) => {
    if (isInput) {
      const newFields = inputFields.filter((_, i) => i !== index);
      setInputFields(newFields);
      onUpdateFunction({ input_schema: convertFieldsToSchema(newFields) });
    } else {
      const newFields = outputFields.filter((_, i) => i !== index);
      setOutputFields(newFields);
      onUpdateFunction({ output_schema: convertFieldsToSchema(newFields) });
    }
  };

  const renderFieldEditor = (field: SchemaField, index: number, isInput: boolean) => (
    <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input
            value={field.name}
            onChange={(e) => updateField(index, { name: e.target.value }, isInput)}
            placeholder="Field name"
            className="w-32"
          />
          {field.required && <Badge variant="secondary" className="text-xs">Required</Badge>}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => removeField(index, isInput)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-gray-600">Type</Label>
          <Select 
            value={field.type} 
            onValueChange={(type) => updateField(index, { type }, isInput)}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="string">String</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="boolean">Boolean</SelectItem>
              <SelectItem value="array">Array</SelectItem>
              <SelectItem value="object">Object</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="file">File</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={field.required}
            onCheckedChange={(required) => updateField(index, { required }, isInput)}
          />
          <Label className="text-xs text-gray-600">Required</Label>
        </div>
      </div>

      <div>
        <Label className="text-xs text-gray-600">Description</Label>
        <Input
          value={field.description}
          onChange={(e) => updateField(index, { description: e.target.value }, isInput)}
          placeholder="Field description..."
          className="h-8 text-xs"
        />
      </div>
    </div>
  );

  const renderJsonEditor = (isInput: boolean) => {
    const schema = isInput ? selectedNode.function.input_schema : selectedNode.function.output_schema;
    
    return (
      <div>
        <Label className="text-sm font-medium text-gray-700">
          {isInput ? 'Input' : 'Output'} Schema (JSON)
        </Label>
        <Textarea
          value={JSON.stringify(schema, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              if (isInput) {
                onUpdateFunction({ input_schema: parsed });
                setInputFields(convertSchemaToFields(parsed));
              } else {
                onUpdateFunction({ output_schema: parsed });
                setOutputFields(convertSchemaToFields(parsed));
              }
            } catch (error) {
              // Invalid JSON - don't update
            }
          }}
          className="mt-1 font-mono text-sm"
          rows={8}
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-medium text-gray-700">Schema Editor</h4>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant={schemaMode === 'visual' ? 'default' : 'ghost'}
            onClick={() => setSchemaMode('visual')}
          >
            Visual
          </Button>
          <Button
            size="sm"
            variant={schemaMode === 'json' ? 'default' : 'ghost'}
            onClick={() => setSchemaMode('json')}
          >
            <Code className="w-4 h-4 mr-1" />
            JSON
          </Button>
        </div>
      </div>

      {schemaMode === 'visual' ? (
        <>
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <Button
              size="sm"
              variant={activeTab === 'input' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('input')}
              className="flex-1"
            >
              Input Schema ({inputFields.length})
            </Button>
            <Button
              size="sm"
              variant={activeTab === 'output' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('output')}
              className="flex-1"
            >
              Output Schema ({outputFields.length})
            </Button>
          </div>

          <div className="space-y-3">
            {activeTab === 'input'
              ? inputFields.map((field, index) => renderFieldEditor(field, index, true))
              : outputFields.map((field, index) => renderFieldEditor(field, index, false))
            }

            <Button
              size="sm"
              variant="outline"
              onClick={() => addField(activeTab === 'input')}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add {activeTab === 'input' ? 'Input' : 'Output'} Field
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          {renderJsonEditor(true)}
          {renderJsonEditor(false)}
        </div>
      )}

      <div className="flex items-start space-x-2 bg-blue-50 p-3 rounded-lg">
        <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-800">
          <p className="font-medium">Schema Tips:</p>
          <ul className="mt-1 space-y-0.5 text-xs">
            <li>• Use clear, descriptive field names</li>
            <li>• Add descriptions to help other developers</li>
            <li>• Mark fields as required when necessary</li>
            <li>• Choose appropriate data types for validation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSchemaEditor;
