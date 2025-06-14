
import React from 'react';
import { EnhancedEdge } from '../types/edgeTypes';
import { EnhancedNode } from '../types/nodeTypes';
import GridDebugOverlay from './canvas/GridDebugOverlay';
import EdgeMarkerDefinitions from './canvas/EdgeMarkerDefinitions';
import IndividualEdgeRenderer from './canvas/IndividualEdgeRenderer';
import { getEnhancedEdgeCalculator } from '../utils/enhancedEdgeCalculations';
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
  getEdgeTooltip
}) => {
  const { settings } = usePathfindingSettings();
  const { getAnimationProgress, isAnimating } = usePathAnimations(
    edges, 
    settings.animatePathChanges
  );
  const bundling = useEdgeBundling(edges, nodes);

  const handleEdgeClick = (e: React.MouseEvent, edgeId: string) => {
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

  const handleEdgeDoubleClick = (e: React.MouseEvent, edgeId: string) => {
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

  const unbundledEdges = bundling.getUnbundledEdges();

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
        
        {bundling.settings.enabled && bundling.bundles.length > 0 && (
          <BundledEdgeRenderer
            bundles={bundling.bundles}
            nodes={nodes}
            selectedEdgeId={selectedEdgeId}
            onSelectEdge={onSelectEdge || onSelectSingleEdge}
            getEdgeValidationClass={getEdgeValidationClass}
          />
        )}
        
        {unbundledEdges.map(edge => {
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
              onEdgeClick={handleEdgeClick}
              onEdgeDoubleClick={handleEdgeDoubleClick}
            />
          );
        })}
      </svg>
    </EdgeAnimationHandler>
  );
};

export default EnhancedEdgeRenderer;
