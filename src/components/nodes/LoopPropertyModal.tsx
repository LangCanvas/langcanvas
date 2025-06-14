
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { EnhancedNode } from '../../types/nodeTypes';
import { NodeLoopConfig, LoopType } from '../../types/loopTypes';
import FunctionLoopSettings from './loop-settings/FunctionLoopSettings';
import ToolLoopSettings from './loop-settings/ToolLoopSettings';
import AgentLoopSettings from './loop-settings/AgentLoopSettings';
import UniversalLoopSettings from './loop-settings/UniversalLoopSettings';

interface LoopPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  node: EnhancedNode;
  loopConfig: NodeLoopConfig;
  onUpdateLoopConfig: (config: NodeLoopConfig) => void;
}

const LoopPropertyModal: React.FC<LoopPropertyModalProps> = ({
  isOpen,
  onClose,
  node,
  loopConfig,
  onUpdateLoopConfig
}) => {
  const [localConfig, setLocalConfig] = useState<NodeLoopConfig>(loopConfig);

  useEffect(() => {
    setLocalConfig(loopConfig);
  }, [loopConfig]);

  const handleSave = () => {
    onUpdateLoopConfig(localConfig);
    onClose();
  };

  const handleCancel = () => {
    setLocalConfig(loopConfig);
    onClose();
  };

  const updateConfig = (updates: Partial<NodeLoopConfig>) => {
    setLocalConfig(prev => ({ ...prev, ...updates }));
  };

  const getNodeTypeSpecificTabs = () => {
    switch (node.type) {
      case 'function':
        return ['function', 'universal'];
      case 'tool':
        return ['tool', 'universal'];
      case 'agent':
        return ['agent', 'universal'];
      default:
        return ['universal'];
    }
  };

  const availableTabs = getNodeTypeSpecificTabs();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Loop Configuration - {node.label} ({node.type})
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={availableTabs[0]} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            {availableTabs.includes('function') && (
              <TabsTrigger value="function">Function Loop</TabsTrigger>
            )}
            {availableTabs.includes('tool') && (
              <TabsTrigger value="tool">Tool Loop</TabsTrigger>
            )}
            {availableTabs.includes('agent') && (
              <TabsTrigger value="agent">Agent Loop</TabsTrigger>
            )}
            <TabsTrigger value="universal">Safety & Control</TabsTrigger>
          </TabsList>

          {availableTabs.includes('function') && (
            <TabsContent value="function" className="space-y-6">
              <FunctionLoopSettings
                config={localConfig}
                onUpdateConfig={updateConfig}
              />
            </TabsContent>
          )}

          {availableTabs.includes('tool') && (
            <TabsContent value="tool" className="space-y-6">
              <ToolLoopSettings
                config={localConfig}
                onUpdateConfig={updateConfig}
              />
            </TabsContent>
          )}

          {availableTabs.includes('agent') && (
            <TabsContent value="agent" className="space-y-6">
              <AgentLoopSettings
                config={localConfig}
                onUpdateConfig={updateConfig}
              />
            </TabsContent>
          )}

          <TabsContent value="universal" className="space-y-6">
            <UniversalLoopSettings
              config={localConfig}
              onUpdateConfig={updateConfig}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoopPropertyModal;
