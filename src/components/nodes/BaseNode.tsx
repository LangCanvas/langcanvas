
import React, { useState } from 'react';
import { BaseNodeProps } from '../../types/nodeProps';
import { useNodeDrag } from '../../hooks/useNodeDrag';
import { sanitizeNodeLabel } from '../../utils/security';
import LoopEnableButton from './LoopEnableButton';
import LoopPropertyModal from './LoopPropertyModal';
import { NodeLoopConfig } from '../../types/loopTypes';

interface BaseNodeComponentProps extends BaseNodeProps {
  children: React.ReactNode;
  nodeStyle: React.CSSProperties;
}

const BaseNode: React.FC<BaseNodeComponentProps> = ({
  node,
  isSelected,
  onSelect,
  onDoubleClick,
  onMove,
  onDragStart,
  validationClass = '',
  validationTooltip = '',
  children,
  nodeStyle
}) => {
  const { nodeRef, isDragging, startDrag } = useNodeDrag(node, onMove, isSelected);
  const sanitizedLabel = sanitizeNodeLabel(node.label);
  
  const [showLoopModal, setShowLoopModal] = useState(false);

  // Get current loop configuration or create default
  const loopConfig: NodeLoopConfig = node.config.loop || {
    enabled: false,
    loopType: 'self-loop',
    terminationConditions: [{
      type: 'max-iterations',
      value: 10,
      description: 'Maximum iterations limit'
    }],
    safetySettings: {
      emergencyStopConditions: [],
      performanceMonitoring: true,
      resourceUsageLimits: {
        memory: 512,
        cpu: 80,
        time: 300
      },
      executionLogging: true
    },
    humanIntervention: {
      manualApprovalPoints: [],
      breakpointInsertion: false,
      realTimeMonitoring: false,
      emergencyStopButton: true
    },
    warnings: []
  };

  const handleToggleLoop = () => {
    setShowLoopModal(true);
  };

  const handleUpdateLoopConfig = (newConfig: NodeLoopConfig) => {
    // This would typically call an onUpdateNode prop to save the loop config
    console.log('Loop config updated:', newConfig);
    // TODO: Implement actual node update logic
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Check if this is a connection handle event by looking at the target
    const target = e.target as HTMLElement;
    const isConnectionHandle = target.closest('[data-handle]');
    const isLoopButton = target.closest('[data-loop-button]');
    
    if (isConnectionHandle || isLoopButton) {
      // Don't interfere with connection handle events or loop button
      return;
    }
    
    // Always call onSelect first to update selection state
    onSelect(node.id, e);
    
    // Check if this will be a multi-drag scenario BEFORE calling onDragStart
    const willBeMultiDrag = isSelected || (e.ctrlKey || e.metaKey || e.shiftKey);
    
    if (willBeMultiDrag && onDragStart) {
      onDragStart(e);
    } else {
      startDrag(e);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDoubleClick) {
      onDoubleClick();
    }
  };

  const isLoopEnabled = loopConfig.enabled;
  const hasLoopWarnings = loopConfig.warnings.length > 0;

  return (
    <>
      <div
        ref={nodeRef}
        style={nodeStyle}
        onPointerDown={handlePointerDown}
        onDoubleClick={handleDoubleClick}
        className={`node ${node.type}-node ${isSelected ? 'selected' : ''} ${validationClass} relative`}
        data-node-id={node.id}
        data-node-type={node.type}
        title={validationTooltip || undefined}
      >
        <span style={{ transform: node.type === 'conditional' ? 'rotate(-45deg)' : 'none' }}>
          {sanitizedLabel}
        </span>
        
        <div data-loop-button>
          <LoopEnableButton
            node={node}
            isLoopEnabled={isLoopEnabled}
            hasLoopWarnings={hasLoopWarnings}
            onToggleLoop={handleToggleLoop}
          />
        </div>
        
        {children}
      </div>

      <LoopPropertyModal
        isOpen={showLoopModal}
        onClose={() => setShowLoopModal(false)}
        node={node}
        loopConfig={loopConfig}
        onUpdateLoopConfig={handleUpdateLoopConfig}
      />
    </>
  );
};

export default BaseNode;
