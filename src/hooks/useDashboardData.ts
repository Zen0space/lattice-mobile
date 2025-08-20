/**
 * useDashboardData Custom Hook
 * 
 * Handles data fetching, caching, and background refresh for dashboards.
 * Provides intelligent caching, offline support, and performance optimizations.
 * 
 * Features:
 * - Intelligent data caching with TTL
 * - Background data refresh
 * - Offline data handling
 * - Data preloading for performance
 * - Memory-efficient cache management
 * - Development debugging tools
 * 
 * Following 2025 React Native best practices for data fetching.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { DashboardDataHook, HookConfig } from './types';

/**
 * Cache entry structure
 */
interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
  dashboardId: string;
  isStale: boolean;
}

/**
 * Configuration for the dashboard data hook
 */
interface UseDashboardDataConfig extends HookConfig {
  cacheTimeout?: number; // Cache TTL in milliseconds
  staleTimeout?: number; // When data becomes stale (but still usable)
  maxCacheSize?: number; // Maximum number of cached entries
  enableOfflineMode?: boolean;
  enableBackgroundRefresh?: boolean;
  refreshInterval?: number; // Background refresh interval in milliseconds
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: UseDashboardDataConfig = {
  enableCache: true,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  staleTimeout: 2 * 60 * 1000, // 2 minutes
  maxCacheSize: 50,
  enableOfflineMode: true,
  enableBackgroundRefresh: false,
  refreshInterval: 30 * 1000, // 30 seconds
  retryAttempts: 3,
  enableDevMode: __DEV__,
};

/**
 * Mock data generator for development and demo purposes
 */
const generateMockData = (dashboardId: string, dashboardType: string) => {
  const baseData = {
    id: dashboardId,
    type: dashboardType,
    lastUpdated: new Date().toISOString(),
    metrics: {
      totalValue: Math.floor(Math.random() * 100000),
      change24h: (Math.random() - 0.5) * 20,
      changePercent: (Math.random() - 0.5) * 10,
    },
  };

  switch (dashboardType) {
    case 'overview':
      return {
        ...baseData,
        assets: Array.from({ length: 5 }, (_, i) => ({
          id: `asset-${i}`,
          name: `Asset ${i + 1}`,
          value: Math.floor(Math.random() * 10000),
          change: (Math.random() - 0.5) * 100,
        })),
        stats: {
          totalPortfolio: Math.floor(Math.random() * 50000),
          todayChange: (Math.random() - 0.5) * 1000,
          totalAssets: 12,
        },
      };
    
    case 'portfolio':
      return {
        ...baseData,
        holdings: Array.from({ length: 8 }, (_, i) => ({
          id: `holding-${i}`,
          symbol: `HOLD${i + 1}`,
          quantity: Math.floor(Math.random() * 100),
          avgPrice: Math.random() * 100,
          currentPrice: Math.random() * 120,
        })),
      };
    
    default:
      return baseData;
  }
};

/**
 * Custom hook for dashboard data management
 */
export const useDashboardData = (
  config: UseDashboardDataConfig = DEFAULT_CONFIG
): DashboardDataHook => {
  // State
  const [dashboardData, setDashboardData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  
  // Cache management
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  /**
   * Get cached data for a dashboard
   */
  const getCachedData = useCallback((dashboardId: string) => {
    const entry = cacheRef.current.get(dashboardId);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    
    // Check if data has expired
    if (now > entry.expiresAt) {
      cacheRef.current.delete(dashboardId);
      return null;
    }

    // Mark as stale if needed
    if (now > entry.timestamp + (config.staleTimeout || DEFAULT_CONFIG.staleTimeout!)) {
      entry.isStale = true;
    }

    return entry.data;
  }, [config.staleTimeout]);

  /**
   * Set cached data for a dashboard
   */
  const setCachedData = useCallback((dashboardId: string, data: any) => {
    if (!config.enableCache) {
      return;
    }

    const now = Date.now();
    const entry: CacheEntry = {
      data,
      timestamp: now,
      expiresAt: now + (config.cacheTimeout || DEFAULT_CONFIG.cacheTimeout!),
      dashboardId,
      isStale: false,
    };

    cacheRef.current.set(dashboardId, entry);

    // Enforce cache size limit
    if (cacheRef.current.size > (config.maxCacheSize || DEFAULT_CONFIG.maxCacheSize!)) {
      // Remove oldest entries
      const entries = Array.from(cacheRef.current.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const entriesToRemove = entries.slice(0, entries.length - config.maxCacheSize! + 1);
      entriesToRemove.forEach(([key]) => {
        cacheRef.current.delete(key);
      });
    }

    if (config.enableDevMode) {
      console.log(`📦 Cached data for dashboard: ${dashboardId} (${cacheRef.current.size} total)`);
    }
  }, [config.enableCache, config.cacheTimeout, config.maxCacheSize, config.enableDevMode]);

  /**
   * Fetch data for a specific dashboard
   */
  const fetchDashboardData = useCallback(async (dashboardId: string, dashboardType?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      if (config.enableDevMode) {
        console.log(`🔄 Fetching data for dashboard: ${dashboardId}`);
      }

      // Check cache first
      const cachedData = getCachedData(dashboardId);
      if (cachedData && !cachedData.isStale) {
        setDashboardData(prev => ({ ...prev, [dashboardId]: cachedData }));
        setIsLoading(false);
        
        if (config.enableDevMode) {
          console.log(`💾 Using cached data for dashboard: ${dashboardId}`);
        }
        return;
      }

      // Simulate API call with mock data
      // In a real app, this would be an actual API call
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      
      const data = generateMockData(dashboardId, dashboardType || 'overview');
      
      // Update state and cache
      setDashboardData(prev => ({ ...prev, [dashboardId]: data }));
      setCachedData(dashboardId, data);
      setLastRefresh(new Date());
      setIsLoading(false);

      if (config.enableDevMode) {
        console.log(`✅ Fetched fresh data for dashboard: ${dashboardId}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard data';
      setError(errorMessage);
      setIsLoading(false);
      
      // Try to use stale cached data as fallback
      if (config.enableOfflineMode) {
        const cachedData = getCachedData(dashboardId);
        if (cachedData) {
          setDashboardData(prev => ({ ...prev, [dashboardId]: cachedData }));
          
          if (config.enableDevMode) {
            console.log(`🔄 Using stale cached data as fallback for: ${dashboardId}`);
          }
        }
      }

      if (config.enableDevMode) {
        console.error(`❌ Error fetching data for dashboard ${dashboardId}:`, error);
      }
    }
  }, [config.enableDevMode, config.enableOfflineMode, getCachedData, setCachedData]);

  /**
   * Refresh data for one or all dashboards
   */
  const refreshData = useCallback(async (dashboardId?: string) => {
    try {
      setError(null);

      if (dashboardId) {
        // Refresh specific dashboard
        invalidateCache(dashboardId);
        await fetchDashboardData(dashboardId);
      } else {
        // Refresh all cached dashboards
        const dashboardIds = Array.from(cacheRef.current.keys());
        
        // Clear cache
        cacheRef.current.clear();
        
        // Refresh all dashboards
        await Promise.all(
          dashboardIds.map(id => fetchDashboardData(id))
        );
      }

      setLastRefresh(new Date());

      if (config.enableDevMode) {
        console.log(`🔄 Refreshed data for ${dashboardId || 'all dashboards'}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh data';
      setError(errorMessage);
      
      if (config.enableDevMode) {
        console.error('❌ Error refreshing data:', error);
      }
    }
  }, [config.enableDevMode, fetchDashboardData]);

  /**
   * Clear cache for specific dashboard or all
   */
  const clearCache = useCallback((dashboardId?: string) => {
    if (dashboardId) {
      cacheRef.current.delete(dashboardId);
      setDashboardData(prev => {
        const newData = { ...prev };
        delete newData[dashboardId];
        return newData;
      });
    } else {
      cacheRef.current.clear();
      setDashboardData({});
    }

    if (config.enableDevMode) {
      console.log(`🗑️ Cleared cache for ${dashboardId || 'all dashboards'}`);
    }
  }, [config.enableDevMode]);

  /**
   * Preload data for multiple dashboards
   */
  const preloadData = useCallback(async (dashboardIds: string[]) => {
    try {
      if (config.enableDevMode) {
        console.log(`⏳ Preloading data for ${dashboardIds.length} dashboards`);
      }

      // Fetch data for all dashboards in parallel
      await Promise.all(
        dashboardIds.map(id => fetchDashboardData(id))
      );

      if (config.enableDevMode) {
        console.log(`✅ Preloaded data for ${dashboardIds.length} dashboards`);
      }
    } catch (error) {
      if (config.enableDevMode) {
        console.error('❌ Error preloading data:', error);
      }
    }
  }, [config.enableDevMode, fetchDashboardData]);

  /**
   * Invalidate cache for specific dashboard
   */
  const invalidateCache = useCallback((dashboardId: string) => {
    cacheRef.current.delete(dashboardId);
    
    if (config.enableDevMode) {
      console.log(`🗑️ Invalidated cache for dashboard: ${dashboardId}`);
    }
  }, [config.enableDevMode]);

  /**
   * Get age of cached data in milliseconds
   */
  const getDataAge = useCallback((dashboardId: string): number => {
    const entry = cacheRef.current.get(dashboardId);
    if (!entry) {
      return -1;
    }
    
    return Date.now() - entry.timestamp;
  }, []);

  /**
   * Enable or disable background sync
   */
  const enableBackgroundSync = useCallback((enabled: boolean) => {
    if (enabled && config.enableBackgroundRefresh) {
      // Start background refresh interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      
      refreshIntervalRef.current = setInterval(() => {
        if (appStateRef.current === 'active') {
          refreshData();
        }
      }, config.refreshInterval || DEFAULT_CONFIG.refreshInterval!);
      
      if (config.enableDevMode) {
        console.log('🔄 Enabled background data sync');
      }
    } else {
      // Stop background refresh
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      
      if (config.enableDevMode) {
        console.log('⏹️ Disabled background data sync');
      }
    }
  }, [config.enableBackgroundRefresh, config.refreshInterval, config.enableDevMode, refreshData]);

  // Handle app state changes for background sync
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      appStateRef.current = nextAppState;
      
      if (nextAppState === 'active' && config.enableBackgroundRefresh) {
        // Refresh data when app becomes active
        refreshData();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, [config.enableBackgroundRefresh, refreshData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  return {
    // State
    dashboardData,
    isLoading,
    error,
    lastRefresh,
    
    // Actions
    fetchDashboardData,
    refreshData,
    clearCache,
    preloadData,
    
    // Cache management
    getCachedData,
    invalidateCache,
    
    // Background sync
    enableBackgroundSync,
    getDataAge,
  };
};
