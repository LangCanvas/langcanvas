
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlayCircle, PauseCircle, StopCircle, RotateCcw, AlertTriangle, TrendingUp } from 'lucide-react';
import { EnhancedEdge } from '../../types/edgeTypes';
import { useLoopManagement } from '../../hooks/useLoopManagement';

interface LoopExecution {
  id: string;
  edgeId: string;
  iteration: number;
  timestamp: Date;
  duration: number;
  state: any;
  success: boolean;
  error?: string;
}

interface LoopDebugPanelProps {
  selectedEdge: EnhancedEdge | null;
  isOpen: boolean;
  onClose: () => void;
}

const LoopDebugPanel: React.FC<LoopDebugPanelProps> = ({
  selectedEdge,
  isOpen,
  onClose
}) => {
  const { getLoopSafetyStatus } = useLoopManagement();
  const [executions, setExecutions] = useState<LoopExecution[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Mock execution data for demonstration
  useEffect(() => {
    if (selectedEdge?.loop) {
      const mockExecutions: LoopExecution[] = [
        {
          id: '1',
          edgeId: selectedEdge.id,
          iteration: 1,
          timestamp: new Date(Date.now() - 5000),
          duration: 150,
          state: { retry_count: 1, success: false },
          success: false,
          error: 'Network timeout'
        },
        {
          id: '2',
          edgeId: selectedEdge.id,
          iteration: 2,
          timestamp: new Date(Date.now() - 3000),
          duration: 120,
          state: { retry_count: 2, success: false },
          success: false,
          error: 'Connection refused'
        },
        {
          id: '3',
          edgeId: selectedEdge.id,
          iteration: 3,
          timestamp: new Date(Date.now() - 1000),
          duration: 80,
          state: { retry_count: 3, success: true },
          success: true
        }
      ];
      setExecutions(mockExecutions);
    }
  }, [selectedEdge]);

  if (!isOpen || !selectedEdge?.loop) return null;

  const safetyStatus = getLoopSafetyStatus(selectedEdge);
  const loopCondition = selectedEdge.loop.loopCondition;
  const totalExecutions = executions.length;
  const successfulExecutions = executions.filter(e => e.success).length;
  const averageDuration = executions.length > 0 
    ? executions.reduce((sum, e) => sum + e.duration, 0) / executions.length 
    : 0;

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
  };

  const handleReset = () => {
    setExecutions([]);
    setIsRunning(false);
    setIsPaused(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Loop Debug Console</h2>
              <p className="text-sm text-gray-600 mt-1">
                Monitor and debug loop execution for: {selectedEdge.loop.loopType} loop
              </p>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        <div className="p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="execution">Execution Log</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="controls">Controls</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total Iterations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalExecutions}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Success Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 0}%
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Avg Duration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Math.round(averageDuration)}ms</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Safety Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge 
                      variant={safetyStatus.status === 'safe' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {safetyStatus.status.toUpperCase()}
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Loop Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Type:</span>
                      <span className="ml-2">{selectedEdge.loop.loopType}</span>
                    </div>
                    <div>
                      <span className="font-medium">Max Iterations:</span>
                      <span className="ml-2">{loopCondition.maxIterations || 'Unlimited'}</span>
                    </div>
                    <div>
                      <span className="font-medium">Human Interrupt:</span>
                      <span className="ml-2">{loopCondition.enableHumanInterrupt ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div>
                      <span className="font-medium">Current Iteration:</span>
                      <span className="ml-2">{loopCondition.iterationCounter || 0}</span>
                    </div>
                  </div>
                  {loopCondition.terminationExpression && (
                    <div>
                      <span className="font-medium text-sm">Termination Condition:</span>
                      <code className="text-xs bg-gray-100 p-2 rounded block mt-1">
                        {loopCondition.terminationExpression}
                      </code>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="execution">
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {executions.map((execution) => (
                    <Card key={execution.id} className={`${execution.success ? 'border-green-200' : 'border-red-200'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant={execution.success ? 'default' : 'destructive'}>
                              Iteration {execution.iteration}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {execution.timestamp.toLocaleTimeString()}
                            </span>
                            <span className="text-sm text-gray-500">
                              {execution.duration}ms
                            </span>
                          </div>
                          {!execution.success && execution.error && (
                            <div className="flex items-center gap-1 text-red-600">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="text-sm">{execution.error}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                          <pre>{JSON.stringify(execution.state, null, 2)}</pre>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="performance">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Total Runtime:</span>
                        <span>{executions.reduce((sum, e) => sum + e.duration, 0)}ms</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Memory Usage:</span>
                        <span>~{Math.round(totalExecutions * 0.5)}KB</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>CPU Usage:</span>
                        <span>{Math.round(averageDuration / 10)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {safetyStatus.status === 'dangerous' && (
                        <div className="text-red-600">⚠️ Add termination condition to prevent infinite loops</div>
                      )}
                      {averageDuration > 100 && (
                        <div className="text-yellow-600">💡 Consider optimizing loop body for better performance</div>
                      )}
                      {totalExecutions > 50 && (
                        <div className="text-blue-600">📊 High iteration count - consider batch processing</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="controls">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Loop Execution Controls</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleStart}
                        disabled={isRunning && !isPaused}
                      >
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Start
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePause}
                        disabled={!isRunning || isPaused}
                      >
                        <PauseCircle className="w-4 h-4 mr-2" />
                        Pause
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleStop}
                        disabled={!isRunning}
                      >
                        <StopCircle className="w-4 h-4 mr-2" />
                        Stop
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Emergency Controls</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="destructive" size="sm" className="w-full">
                      🚨 Emergency Stop All Loops
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      Immediately halt all running loops in the workflow
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default LoopDebugPanel;
