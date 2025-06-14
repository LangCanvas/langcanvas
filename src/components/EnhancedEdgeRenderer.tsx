
import React from 'react';
import { EnhancedEdge } from '../types/edgeTypes';
import { EnhancedNode } from '../types/nodeTypes';
import GridDebugOverlay from './canvas/GridDebugOverlay';
import EdgeMarkerDefinitions from './canvas/EdgeMarkerDefinitions';
import IndividualEdgeRenderer from './canvas/IndividualEdgeRenderer';
import MultiEdgeRenderer from './canvas/MultiEdgeRenderer';
import EdgeSelectionHandler from './canvas/EdgeSelectionHandler';
import { getEnhancedEdgeCalculator } from '../utils/enhancedEdgeCalculations';
import { MultiEdgeCalculator } from '../utils/multiEdgeCalculations';
import { usePathfindingSettings } from '../hooks/usePathfindingSettings';
import { usePathAnimations } from '../hooks/usePathAnimations';
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
  onSelectionChange
}) => {
  const { settings } = usePathfindingSettings();
  const { getAnimationProgress, isAnimating } = usePathAnimations(
    edges, 
    settings.animatePathChanges
  );
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

  const getAnimatedOpacity = (edgeId: string): number => {
    if (!settings.animatePathChanges || !isAnimating(edgeId)) return 1;
    
    const progress = getAnimationProgress(edgeId);
    return 0.3 + (0.7 * progress);
  };

  if (edges.length === 0 && !settings.enableDebugGrid) return null;

  return (
    <EdgeAnimationHandler
      edges={edges}
      nodes={nodes}
      animatePathChanges={settings.animatePathChanges}
    >
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
            edges={edges}
            onSelectionChange={onSelectionChange}
            onEdgeDoubleClick={onDoubleClick}
          >
            {({ selectedEdgeIds: advancedSelectedIds, onEdgeClick, onEdgeDoubleClick: advancedDoubleClick }) => (
              <MultiEdgeRenderer
                multiEdgeGroups={multiEdgeGroups}
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
        
        {/* Individual edges rendering */}
        {individualEdges.map(edge => {
          const sourceNode = nodes.find(n => n.id === edge.source);
          const targetNode = nodes.find(n => n.id === edge.target);
          
          if (!sourceNode || !targetNode) return null;
          
          const isSelected = selectedEdgeId === edge.id;
          const isMultiSelected = selectedEdgeIds.includes(edge.id);
          const validationClass = getEdgeValidationClass?.(edge.id) || '';
          const tooltip = getEdgeTooltip?.(edge.id) || '';
          const animatedOpacity = getAnimatedOpacity(edge.id);
          
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
              onEdgeClick={handleLegacyEdgeClick}
              onEdgeDoubleClick={handleLegacyEdgeDoubleClick}
            />
          );
        })}
      </svg>
    </EdgeAnimationHandler>
  );
};

export default EnhancedEdgeRenderer;
