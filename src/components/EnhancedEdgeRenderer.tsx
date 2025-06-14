
import React from 'react';
import { EnhancedEdge } from '../types/edgeTypes';
import { EnhancedNode } from '../types/nodeTypes';
import { MultiEdgeCalculator } from '../utils/multiEdgeCalculations';
import { usePathfindingSettings } from '../hooks/usePathfindingSettings';
import { useEdgeBundling } from '../hooks/useEdgeBundling';
import EdgeAnimationHandler from './canvas/EdgeAnimationHandler';
import EdgeVirtualization from './canvas/EdgeVirtualization';
import EdgeRenderingManager from './canvas/EdgeRenderingManager';
import EdgeGroupRenderer from './canvas/EdgeGroupRenderer';
import IndividualEdgesRenderer from './canvas/IndividualEdgesRenderer';

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
          {(animationProps) => (
            <EdgeRenderingManager
              edges={visibleEdges}
              nodes={nodes}
              enableDebugGrid={settings.enableDebugGrid}
            >
              <EdgeGroupRenderer
                bundling={bundling}
                multiEdgeGroups={multiEdgeGroups}
                visibleEdges={visibleEdges}
                nodes={nodes}
                selectedEdgeId={selectedEdgeId}
                selectedEdgeIds={selectedEdgeIds}
                onSelectEdge={onSelectEdge}
                onSelectSingleEdge={onSelectSingleEdge}
                onSelectionChange={onSelectionChange}
                onDoubleClick={onDoubleClick}
                getEdgeValidationClass={getEdgeValidationClass}
                getEdgeTooltip={getEdgeTooltip}
                enableMultiEdge={enableMultiEdge}
              />
              
              <IndividualEdgesRenderer
                edges={individualEdges.filter(edge => visibleEdges.includes(edge))}
                nodes={nodes}
                selectedEdgeId={selectedEdgeId}
                selectedEdgeIds={selectedEdgeIds}
                hoveredEdgeId={animationProps.hoveredEdgeId}
                lodLevel={lodLevel}
                settings={settings}
                getAnimationProgress={animationProps.getAnimationProgress}
                isAnimating={animationProps.isAnimating}
                setEdgeHover={animationProps.setEdgeHover}
                startDataFlow={animationProps.startDataFlow}
                stopDataFlow={animationProps.stopDataFlow}
                getDataFlowParticles={animationProps.getDataFlowParticles}
                onEdgeClick={handleLegacyEdgeClick}
                onEdgeDoubleClick={handleLegacyEdgeDoubleClick}
                getEdgeValidationClass={getEdgeValidationClass}
                getEdgeTooltip={getEdgeTooltip}
              />
            </EdgeRenderingManager>
          )}
        </EdgeAnimationHandler>
      )}
    </EdgeVirtualization>
  );
};

export default EnhancedEdgeRenderer;
