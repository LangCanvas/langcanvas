
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { usePathfindingSettings } from '../../hooks/usePathfindingSettings';
import { useAStarPathfinding } from '../../hooks/useAStarPathfinding';
import { EnhancedNode } from '../../types/nodeTypes';
import { Settings, Zap, Activity, Trash2 } from 'lucide-react';

interface PathfindingSettingsPanelProps {
  nodes: EnhancedNode[];
  className?: string;
}

const PathfindingSettingsPanel: React.FC<PathfindingSettingsPanelProps> = ({
  nodes,
  className = ''
}) => {
  const { settings, updateSetting, resetSettings } = usePathfindingSettings();
  const { getPathfindingStats, clearCache } = useAStarPathfinding(nodes);

  const stats = getPathfindingStats();

  const handleQualityChange = (value: string) => {
    updateSetting('pathQuality', value as 'fast' | 'balanced' | 'smooth');
  };

  const handleGridSizeChange = (value: number[]) => {
    updateSetting('gridCellSize', value[0]);
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Pathfinding Settings
        </CardTitle>
        <CardDescription>
          Configure A* pathfinding behavior and visual options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Path Quality Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Path Quality</label>
          <Select value={settings.pathQuality} onValueChange={handleQualityChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fast">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Fast - Basic routing
                </div>
              </SelectItem>
              <SelectItem value="balanced">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Balanced - Optimized paths
                </div>
              </SelectItem>
              <SelectItem value="smooth">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Smooth - Advanced smoothing
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Debug Grid Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <label className="text-sm font-medium">Debug Grid</label>
            <p className="text-xs text-muted-foreground">
              Show pathfinding grid overlay
            </p>
          </div>
          <Switch
            checked={settings.enableDebugGrid}
            onCheckedChange={(checked) => updateSetting('enableDebugGrid', checked)}
          />
        </div>

        {/* Animation Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <label className="text-sm font-medium">Animate Changes</label>
            <p className="text-xs text-muted-foreground">
              Smooth path transitions
            </p>
          </div>
          <Switch
            checked={settings.animatePathChanges}
            onCheckedChange={(checked) => updateSetting('animatePathChanges', checked)}
          />
        </div>

        {/* Cache Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <label className="text-sm font-medium">Path Caching</label>
            <p className="text-xs text-muted-foreground">
              Cache calculated paths for performance
            </p>
          </div>
          <Switch
            checked={settings.cacheEnabled}
            onCheckedChange={(checked) => updateSetting('cacheEnabled', checked)}
          />
        </div>

        {/* Grid Cell Size */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Grid Cell Size: {settings.gridCellSize}px
          </label>
          <Slider
            value={[settings.gridCellSize]}
            onValueChange={handleGridSizeChange}
            min={10}
            max={50}
            step={5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Smaller cells = more precise paths, larger cells = better performance
          </p>
        </div>

        {/* Performance Stats */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="text-sm font-medium">Performance Stats</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Grid Size</p>
              <Badge variant="outline">{stats.gridSize}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Cells</p>
              <Badge variant="outline">{stats.totalCells.toLocaleString()}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Cache Size</p>
              <Badge variant="outline">{stats.cacheSize}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Node Count</p>
              <Badge variant="outline">{stats.nodeCount}</Badge>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={clearCache}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear Cache
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetSettings}
          >
            Reset Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PathfindingSettingsPanel;
