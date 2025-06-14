
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { usePathfindingSettings } from '../../hooks/usePathfindingSettings';
import { useAStarPathfinding } from '../../hooks/useAStarPathfinding';
import { useEdgeBundling } from '../../hooks/useEdgeBundling';
import { EnhancedNode } from '../../types/nodeTypes';
import { EnhancedEdge } from '../../types/edgeTypes';
import { Settings, Zap, Activity, Trash2, GitBranch } from 'lucide-react';

interface PathfindingSettingsPanelProps {
  nodes: EnhancedNode[];
  edges?: EnhancedEdge[];
  className?: string;
}

const PathfindingSettingsPanel: React.FC<PathfindingSettingsPanelProps> = ({
  nodes,
  edges = [],
  className = ''
}) => {
  const { settings, updateSetting, resetSettings } = usePathfindingSettings();
  const { getPathfindingStats, clearCache } = useAStarPathfinding(nodes);
  const bundling = useEdgeBundling(edges, nodes);

  const stats = getPathfindingStats();
  const bundlingStats = bundling.getBundlingStats();

  const handleQualityChange = (value: string) => {
    updateSetting('pathQuality', value as 'fast' | 'balanced' | 'smooth');
  };

  const handleGridSizeChange = (value: number[]) => {
    updateSetting('gridCellSize', value[0]);
  };

  const handleBundleStrengthChange = (value: number[]) => {
    bundling.updateSetting('bundleStrength', value[0] / 100);
  };

  const handleSeparationDistanceChange = (value: number[]) => {
    bundling.updateSetting('separationDistance', value[0]);
  };

  const handleMinEdgesChange = (value: number[]) => {
    bundling.updateSetting('minEdgesForBundle', value[0]);
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Pathfinding Settings
        </CardTitle>
        <CardDescription>
          Configure A* pathfinding behavior, edge bundling, and visual options
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

        {/* Edge Bundling Section */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            <h4 className="text-sm font-medium">Edge Bundling</h4>
          </div>
          
          {/* Enable Bundling */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-medium">Enable Bundling</label>
              <p className="text-xs text-muted-foreground">
                Group parallel edges to reduce visual clutter
              </p>
            </div>
            <Switch
              checked={bundling.settings.enabled}
              onCheckedChange={(checked) => bundling.updateSetting('enabled', checked)}
            />
          </div>

          {bundling.settings.enabled && (
            <>
              {/* Bundle Strength */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Bundle Strength: {Math.round(bundling.settings.bundleStrength * 100)}%
                </label>
                <Slider
                  value={[bundling.settings.bundleStrength * 100]}
                  onValueChange={handleBundleStrengthChange}
                  min={0}
                  max={100}
                  step={10}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  How tightly edges are bundled together
                </p>
              </div>

              {/* Separation Distance */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Separation Distance: {bundling.settings.separationDistance}px
                </label>
                <Slider
                  value={[bundling.settings.separationDistance]}
                  onValueChange={handleSeparationDistanceChange}
                  min={4}
                  max={20}
                  step={2}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Space between individual edges in a bundle
                </p>
              </div>

              {/* Minimum Edges for Bundle */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Min Edges for Bundle: {bundling.settings.minEdgesForBundle}
                </label>
                <Slider
                  value={[bundling.settings.minEdgesForBundle]}
                  onValueChange={handleMinEdgesChange}
                  min={2}
                  max={5}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum edges required to form a bundle
                </p>
              </div>
            </>
          )}
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

        {/* Bundling Stats */}
        {bundling.settings.enabled && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-medium">Bundling Stats</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Total Bundles</p>
                <Badge variant="outline">{bundlingStats.totalBundles}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Bundled Edges</p>
                <Badge variant="outline">{bundlingStats.bundledEdges}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Unbundled Edges</p>
                <Badge variant="outline">{bundlingStats.unbundledEdges}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Total Edges</p>
                <Badge variant="outline">{edges.length}</Badge>
              </div>
            </div>
          </div>
        )}

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
          {bundling.settings.enabled && (
            <Button
              variant="outline"
              size="sm"
              onClick={bundling.resetSettings}
            >
              Reset Bundling
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PathfindingSettingsPanel;
