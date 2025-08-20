import './global.css';
import React, { useEffect } from 'react';
import { AppNavigator } from './src/navigation';
import { initializeBundleAnalysis } from './src/utils/bundleAnalysis';
import { imageCacheManager } from './src/utils/assetOptimization';

export default function App() {
  useEffect(() => {
    // Initialize bundle analysis in development
    if (__DEV__) {
      initializeBundleAnalysis({
        enableLogging: true,
        trackChunkLoading: true,
        monitorMemoryUsage: true,
        reportThreshold: 100, // 100MB threshold for this app
      });
    }

    // Preload critical assets
    imageCacheManager.preloadCriticalAssets();
  }, []);

  return <AppNavigator />;
}
