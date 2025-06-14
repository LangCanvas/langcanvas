
import React from 'react';
import { Skeleton } from './skeleton';

interface NodePaletteSkeletonProps {
  count?: number;
}

export const NodePaletteSkeleton: React.FC<NodePaletteSkeletonProps> = ({ count = 7 }) => (
  <div className="space-y-3 p-4">
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-8 rounded-lg" />
    </div>
    <Skeleton className="h-10 w-full rounded-lg" />
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  </div>
);

interface PropertiesPanelSkeletonProps {
  showTabs?: boolean;
}

export const PropertiesPanelSkeleton: React.FC<PropertiesPanelSkeletonProps> = ({ showTabs = true }) => (
  <div className="p-4 space-y-4">
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-8 rounded-lg" />
    </div>
    
    {showTabs && (
      <div className="flex space-x-1 mb-4">
        <Skeleton className="h-8 w-16 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-18 rounded-md" />
      </div>
    )}
    
    <div className="space-y-4">
      <div>
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
      <div>
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  </div>
);

interface CanvasSkeletonProps {
  nodeCount?: number;
}

export const CanvasSkeleton: React.FC<CanvasSkeletonProps> = ({ nodeCount = 5 }) => (
  <div className="relative w-full h-full bg-gray-50">
    {Array.from({ length: nodeCount }).map((_, i) => (
      <Skeleton 
        key={i}
        className="absolute rounded-xl"
        style={{
          left: `${20 + (i * 150)}px`,
          top: `${50 + (i * 80)}px`,
          width: '120px',
          height: '60px'
        }}
      />
    ))}
  </div>
);

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`} />
  );
};

export const LoadingOverlay: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative">
    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
      <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2 shadow-lg">
        <LoadingSpinner />
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    </div>
    {children}
  </div>
);
