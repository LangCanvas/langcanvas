
import React from 'react';

interface MainCanvasAreaProps {
  children: React.ReactNode;
  isLeftPanelVisible: boolean;
  isLeftPanelExpanded: boolean;
  isRightPanelVisible: boolean;
  isRightPanelExpanded: boolean;
}

const MainCanvasArea: React.FC<MainCanvasAreaProps> = ({
  children,
  isLeftPanelVisible,
  isLeftPanelExpanded,
  isRightPanelVisible,
  isRightPanelExpanded,
}) => {
  // Calculate margins for the canvas based on panel states
  const leftMargin = isLeftPanelVisible ? (isLeftPanelExpanded ? 'ml-80' : 'ml-14') : 'ml-0';
  const rightMargin = isRightPanelVisible ? (isRightPanelExpanded ? 'mr-80' : 'mr-14') : 'mr-0';

  return (
    <main 
      className={`flex-1 relative min-w-0 transition-all duration-200 ${leftMargin} ${rightMargin}`}
    >
      {children}
    </main>
  );
};

export default MainCanvasArea;
