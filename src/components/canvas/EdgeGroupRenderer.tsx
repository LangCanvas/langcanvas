
import React from 'react';
import { EnhancedEdge } from '../../types/edgeTypes';
import { EnhancedNode } from '../../types/nodeTypes';
import BundledEdgeRenderer from './BundledEdgeRenderer';
import MultiEdgeRenderer from './MultiEdgeRenderer';
import EdgeSelectionHandler from './EdgeSelectionHandler';
import { MultiEdgeGroup } from '../../utils/multiEdgeCalculations';

interface EdgeGroupRendererProps {
  bundling: any;
  multiEdgeGroups: MultiEdgeGroup[];
  visibleEdges: EnhancedEdge[];
  nodes: EnhancedNode[];
  selectedEdgeId: string | null;
  selectedEdgeIds: string[];
  onSelectEdge?: (edgeId: string | null) => void;
  onSelectSingleEdge?: (edgeId: string | null) => void;
  onSelectionChange?: (selectedEdges: EnhancedEdge[]) => void;
  onDoubleClick?: (edgeId: string) => void;
  getEdgeValidationClass?: (edgeId: string) => string;
  getEdgeTooltip?: (edgeId: string) => string;
  enableMultiEdge: boolean;
}

const EdgeGroupRenderer: React.FC<EdgeGroupRendererProps> = ({
  bundling,
  multiEdgeGroups,
  visibleEdges,
  nodes,
  selectedEdgeId,
  selectedEdgeIds,
  onSelectEdge,
  onSelectSingleEdge,
  onSelectionChange,
  onDoubleClick,
  getEdgeValidationClass,
  getEdgeTooltip,
  enableMultiEdge
}) => {
  return (
    <>
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
    </>
  );
};

export default EdgeGroupRenderer;
