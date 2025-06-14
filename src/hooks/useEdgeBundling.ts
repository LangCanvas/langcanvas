
import { useState, useEffect, useMemo } from 'react';
import { EnhancedEdge } from '../types/edgeTypes';
import { EnhancedNode } from '../types/nodeTypes';
import { 
  EdgeBundlingCalculator, 
  BundleGroup, 
  BundlingSettings, 
  defaultBundlingSettings,
  getEdgeBundlingCalculator,
  updateBundlingSettings
} from '../utils/edgeBundling';

export const useEdgeBundling = (
  edges: EnhancedEdge[], 
  nodes: EnhancedNode[]
) => {
  const [settings, setSettings] = useState<BundlingSettings>(defaultBundlingSettings);
  const [bundles, setBundles] = useState<BundleGroup[]>([]);

  const calculator = useMemo(() => getEdgeBundlingCalculator(), []);

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('edge-bundling-settings');
    if (stored) {
      try {
        const parsedSettings = JSON.parse(stored);
        setSettings({ ...defaultBundlingSettings, ...parsedSettings });
        updateBundlingSettings(parsedSettings);
      } catch (error) {
        console.warn('Failed to load bundling settings:', error);
      }
    }
  }, []);

  // Recalculate bundles when edges, nodes, or settings change
  useEffect(() => {
    if (settings.enabled && edges.length >= settings.minEdgesForBundle) {
      const newBundles = calculator.calculateBundles(edges, nodes);
      setBundles(newBundles);
    } else {
      setBundles([]);
    }
  }, [edges, nodes, settings, calculator]);

  const updateSetting = <K extends keyof BundlingSettings>(
    key: K, 
    value: BundlingSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    updateBundlingSettings(newSettings);
    
    // Save to localStorage
    localStorage.setItem('edge-bundling-settings', JSON.stringify(newSettings));
  };

  const resetSettings = () => {
    setSettings(defaultBundlingSettings);
    updateBundlingSettings(defaultBundlingSettings);
    localStorage.removeItem('edge-bundling-settings');
  };

  const getBundlingStats = () => {
    return {
      ...calculator.getBundleStats(),
      totalBundles: bundles.length,
      bundledEdges: bundles.reduce((sum, bundle) => sum + bundle.edges.length, 0),
      unbundledEdges: edges.length - bundles.reduce((sum, bundle) => sum + bundle.edges.length, 0)
    };
  };

  const isEdgeBundled = (edgeId: string): boolean => {
    return bundles.some(bundle => 
      bundle.edges.some(edge => edge.id === edgeId)
    );
  };

  const getBundleForEdge = (edgeId: string): BundleGroup | null => {
    return bundles.find(bundle => 
      bundle.edges.some(edge => edge.id === edgeId)
    ) || null;
  };

  const getUnbundledEdges = (): EnhancedEdge[] => {
    const bundledEdgeIds = new Set(
      bundles.flatMap(bundle => bundle.edges.map(edge => edge.id))
    );
    return edges.filter(edge => !bundledEdgeIds.has(edge.id));
  };

  return {
    settings,
    bundles,
    updateSetting,
    resetSettings,
    getBundlingStats,
    isEdgeBundled,
    getBundleForEdge,
    getUnbundledEdges
  };
};
