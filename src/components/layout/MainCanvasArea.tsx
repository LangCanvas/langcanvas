import React from 'react';

// This component is deprecated - we now use ResizablePanelGroup directly in MainApplicationLayout
// Keeping as a simple passthrough for any remaining references

interface MainCanvasAreaProps {
  children: React.ReactNode;
  isLeftPanelVisible?: boolean;
  isLeftPanelExpanded?: boolean;
  isRightPanelVisible?: boolean;
  isRightPanelExpanded?: boolean;
}

const MainCanvasArea: React.FC<MainCanvasAreaProps> = ({
  children,
}) => {
  return <>{children}</>;
};

export default MainCanvasArea;
