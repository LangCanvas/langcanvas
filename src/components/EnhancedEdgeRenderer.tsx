
import React from 'react';
import { EnhancedEdge } from '../types/edgeTypes';
import { EnhancedNode } from '../types/nodeTypes';
import GridDebugOverlay from './canvas/GridDebugOverlay';
import EdgeMarkerDefinitions from './canvas/EdgeMarkerDefinitions';
import IndividualEdgeRenderer from './canvas/IndividualEdgeRenderer';
import MultiEdgeRenderer from './canvas/MultiEdgeRenderer';
import EdgeSelectionHandler from './canvas/EdgeSelectionHandler';
import EdgeVirtualization from './canvas/EdgeVirtualization';
import { getEnhancedEdgeCalculator } from '../utils/enhancedEdgeCalculations';
import { MultiEdgeCalculator } from '../utils/multiEdgeCalculations';
import { EdgePerformanceOptimizer, EdgeLODManager } from '../utils/edgePerformance';
import { usePathfindingSettings } from '../hooks/usePathfindingSettings';
import { useEdgeBundling } from '../hooks/useEdgeBundling';
import EdgeAnimationHandler from './canvas/EdgeAnimationHandler';
import BundledEdgeRenderer from './canvas/BundledEdgeRenderer';

interface EnhancedEdgeRendererProps {
  edges: EnhancedEdge[];
  nodes: EnhancedNode[];
  selectedEdgeId: string | null;
  selectedEdgeIds?: string[];
  onSelectSingleEdge?: (edgeId: string | null) => void;
  onToggleEdgeSelection?: (edgeId: string, isCtrlOrShiftPressed: boolean) => void;
  onDoubleClick?: (edgeId: string) => void;
  onSelectEdge?: (edgeId: string | null) => void;
  getEdgeValidationClass?: (edgeId: string) => string;
  getEdgeTooltip?: (edgeId: string) => string;
  enableMultiEdge?: boolean;
  onSelectionChange?: (selectedEdges: EnhancedEdge[]) => void;
  viewportBounds?: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

const EnhancedEdgeRenderer: React.FC<EnhancedEdgeRendererProps> = ({ 
  edges, 
  nodes, 
  selectedEdgeId, 
  selectedEdgeIds = [],
  onSelectSingleEdge,
  onToggleEdgeSelection,
  onDoubleClick,
  onSelectEdge,
  getEdgeValidationClass,
  getEdgeTooltip,
  enableMultiEdge = true,
  onSelectionChange,
  viewportBounds = {
    minX: -1000,
    minY: -1000,
    maxX: 4000,
    maxY: 4000
  }
}) => {
  const { settings } = usePathfindingSettings();
  const bundling = useEdgeBundling(edges, nodes);

  // Group parallel edges for multi-edge rendering
  const multiEdgeGroups = enableMultiEdge ? MultiEdgeCalculator.groupParallelEdges(edges) : [];
  const parallelEdgeIds = new Set(
    multiEdgeGroups.flatMap(group => group.edges.map(edge => edge.id))
  );
  
  // Filter out edges that are part of multi-edge groups and bundles
  const unbundledEdges = bundling.getUnbundledEdges();
  const individualEdges = unbundledEdges.filter(edge => !parallelEdgeIds.has(edge.id));

  const handleLegacyEdgeClick = (e: React.MouseEvent, edgeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isCtrlOrShiftPressed = e.ctrlKey || e.shiftKey || e.metaKey;
    
    if (onToggleEdgeSelection && isCtrlOrShiftPressed) {
      onToggleEdgeSelection(edgeId, true);
    } else if (onSelectSingleEdge) {
      onSelectSingleEdge(selectedEdgeId === edgeId ? null : edgeId);
    } else if (onSelectEdge) {
      onSelectEdge(selectedEdgeId === edgeId ? null : edgeId);
    }
    
    console.log(`🔗 Enhanced edge clicked: ${edgeId}`);
  };

  const handleLegacyEdgeDoubleClick = (e: React.MouseEvent, edgeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onDoubleClick) {
      onDoubleClick(edgeId);
    }
  };

  if (edges.length === 0 && !settings.enableDebugGrid) return null;

  return (
    <EdgeVirtualization
      edges={edges}
      nodes={nodes}
      viewportBounds={viewportBounds}
    >
      {(visibleEdges, lodLevel) => (
        <EdgeAnimationHandler
          edges={visibleEdges}
          nodes={nodes}
          animatePathChanges={settings.animatePathChanges}
          enableDataFlow={settings.enableDataFlow}
        >
          {({ 
            getAnimationProgress, 
            isAnimating, 
            hoveredEdgeId, 
            setEdgeHover,
            startDataFlow,
            stopDataFlow,
            getDataFlowParticles 
          }) => (
            <svg 
              className="absolute inset-0 z-10" 
              style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
            >
              <EdgeMarkerDefinitions />
              
              {settings.enableDebugGrid && (
                <GridDebugOverlay 
                  grid={getEnhancedEdgeCalculator().getGridSystem()} 
                  visible={settings.enableDebugGrid}
                  opacity={0.2}
                />
              )}
              
              {/* Bundled edges rendering */}
              {bundling.settings.enabled && bundling.bundles.length > 0 && (
                <BundledEdgeRenderer
                  bundles={bundling.bundles}
                  nodes={nodes}
                  selectedEdgeId={selectedEdgeId}
                  onSelectEdge={onSelectEdge || onSelectSingleEdge}
                  getEdgeValidationClass={getEdgeValidationClass}
                />
              )}
              
              {/* Multi-edge rendering with advanced selection */}
              {enableMultiEdge && multiEdgeGroups.length > 0 && (
                <EdgeSelectionHandler
                  edges={visibleEdges}
                  onSelectionChange={onSelectionChange}
                  onEdgeDoubleClick={onDoubleClick}
                >
                  {({ selectedEdgeIds: advancedSelectedIds, onEdgeClick, onEdgeDoubleClick: advancedDoubleClick }) => (
                    <MultiEdgeRenderer
                      multiEdgeGroups={multiEdgeGroups.filter(group => 
                        group.edges.some(edge => visibleEdges.includes(edge))
                      )}
                      nodes={nodes}
                      selectedEdgeIds={[...selectedEdgeIds, ...advancedSelectedIds]}
                      onEdgeClick={onEdgeClick}
                      onEdgeDoubleClick={advancedDoubleClick}
                      getEdgeValidationClass={getEdgeValidationClass}
                      getEdgeTooltip={getEdgeTooltip}
                    />
                  )}
                </EdgeSelectionHandler>
              )}
              
              {/* Individual edges rendering with LOD optimization */}
              {EdgePerformanceOptimizer.optimizeRenderList(
                individualEdges.filter(edge => visibleEdges.includes(edge)),
                edge => edge.id,
                () => true,
                lodLevel === 'low' ? 50 : lodLevel === 'medium' ? 100 : 200
              ).map(edge => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);
                
                if (!sourceNode || !targetNode) return null;
                
                const isSelected = selectedEdgeId === edge.id;
                const isMultiSelected = selectedEdgeIds.includes(edge.id);
                const isHovered = hoveredEdgeId === edge.id;
                const validationClass = getEdgeValidationClass?.(edge.id) || '';
                const tooltip = getEdgeTooltip?.(edge.id) || '';
                
                // Get animation progress
                const creationProgress = getAnimationProgress(edge.id, 'create');
                const updateProgress = getAnimationProgress(edge.id, 'update');
                const hoverProgress = getAnimationProgress(edge.id, 'hover');
                
                // Calculate animated opacity and scale
                const baseOpacity = isAnimating(edge.id, 'create') ? creationProgress : 1;
                const hoverOpacity = isHovered ? 0.8 + (0.2 * hoverProgress) : 1;
                const animatedOpacity = baseOpacity * hoverOpacity;
                
                return (
                  <IndividualEdgeRenderer
                    key={edge.id}
                    edge={edge}
                    sourceNode={sourceNode}
                    targetNode={targetNode}
                    isSelected={isSelected}
                    isMultiSelected={isMultiSelected}
                    validationClass={validationClass}
                    tooltip={tooltip}
                    animatedOpacity={animatedOpacity}
                    animatePathChanges={settings.animatePathChanges}
                    lodLevel={lodLevel}
                    onEdgeClick={handleLegacyEdgeClick}
                    onEdgeDoubleClick={handleLegacyEdgeDoubleClick}
                    onEdgeHover={setEdgeHover}
                    startDataFlow={startDataFlow}
                    stopDataFlow={stopDataFlow}
                    dataFlowParticles={getDataFlowParticles(edge.id)}
                  />
                );
              })}
            </svg>
          )}
        </EdgeAnimationHandler>
      )}
    </EdgeVirtualization>
  );
};

export default EnhancedEdgeRenderer;
