/**
 * useDashboardManager Custom Hook
 *
 * Centralized dashboard state management hook that provides:
 * - Safe dashboard CRUD operations
 * - Crash-proof deletion logic
 * - Optimistic updates with rollback
 * - Comprehensive error handling
 * - Development debugging tools
 *
 * Following 2025 React Native best practices for custom hooks.
 */

import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DashboardConfig, DashboardType } from '../components/dashboard/types';
import { DASHBOARD_TEMPLATES } from '../components/dashboard/DashboardTemplates';
import { dashboardStorage, widgetStorage } from '../stores/storage';
import { useDashboardStore } from '../stores/dashboardStore';
import { DashboardManagerHook, HookError } from './types';

/**
 * Configuration options for the dashboard manager hook
 */
interface UseDashboardManagerConfig {
  enableOptimisticUpdates?: boolean;
  enableAutoSave?: boolean;
  enableDevMode?: boolean;
  retryAttempts?: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: UseDashboardManagerConfig = {
  enableOptimisticUpdates: true,
  enableAutoSave: true,
  enableDevMode: __DEV__,
  retryAttempts: 3,
};

/**
 * Custom hook for dashboard management
 */
export const useDashboardManager = (
  config: UseDashboardManagerConfig = DEFAULT_CONFIG
): DashboardManagerHook => {
  // Zustand store integration
  const {
    dashboards,
    activeDashboardId,
    isLoading,
    error,
    setDashboards,
    addDashboard,
    updateDashboard: updateDashboardStore,
    deleteDashboard: deleteDashboardStore,
    setActiveDashboard,
    setLoading,
    setError,
    canDeleteDashboard: canDeleteDashboardStore,
    safeDeleteDashboard,
    validateState,
    resetToDefaults,
  } = useDashboardStore();

  // Local state for optimistic updates
  const [optimisticDashboards, setOptimisticDashboards] = useState<DashboardConfig[]>([]);
  const [retryCount, setRetryCount] = useState(0);

  // Use optimistic dashboards if enabled, otherwise use store dashboards
  const currentDashboards =
    config.enableOptimisticUpdates && optimisticDashboards.length > 0
      ? optimisticDashboards
      : dashboards;

  /**
   * Initialize dashboards - Zustand persistence will handle loading
   * Only initialize defaults if no dashboards exist in store
   */
  const loadDashboards = useCallback(async () => {
    try {
      const { setLoading, setError, setDashboards, setActiveDashboard, dashboards } =
        useDashboardStore.getState();

      setLoading(true);
      setError(null);

      if (config.enableDevMode) {
        if (__DEV__) {
          console.log('🔄 Initializing dashboards...');
        }
      }

      // Check if Zustand store already has dashboards (from persistence)
      if (dashboards.length === 0) {
        // Initialize default dashboards if none exist
        const defaultDashboards: DashboardConfig[] = [
          {
            id: 'overview-default',
            name: 'Overview',
            type: 'overview',
            icon: 'home',
            color: '#10a37f',
            isDefault: true,
            createdAt: new Date(),
            lastAccessed: new Date(),
            settings: DASHBOARD_TEMPLATES.overview.defaultSettings,
          },
        ];

        setDashboards(defaultDashboards);
        setActiveDashboard('overview-default');

        if (config.enableDevMode) {
          if (__DEV__) {
            console.log('✅ Initialized default dashboards');
          }
        }
      } else {
        if (config.enableDevMode) {
          if (__DEV__) {
            console.log(`✅ Found ${dashboards.length} persisted dashboards`);
          }
        }
      }

      setLoading(false);
    } catch (error) {
      const { setError, setLoading } = useDashboardStore.getState();
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to initialize dashboards';
      setError(errorMessage);
      setLoading(false);

      if (config.enableDevMode) {
        console.error('❌ Error initializing dashboards:', error);
      }

      Alert.alert('Error', errorMessage);
    }
  }, [config.enableDevMode]);

  /**
   * Create a new dashboard with optimistic updates
   */
  const createDashboard = useCallback(
    async (name: string, template: any) => {
      try {
        setLoading(true);
        setError(null);

        const templateConfig = DASHBOARD_TEMPLATES[template as DashboardType];
        const newDashboard: DashboardConfig = {
          id: `${template}-${Date.now()}`,
          name: name,
          type: template,
          icon: templateConfig.icon,
          color: templateConfig.color,
          isDefault: false,
          createdAt: new Date(),
          lastAccessed: new Date(),
          settings: { ...templateConfig.defaultSettings },
        };

        // Optimistic update
        if (config.enableOptimisticUpdates) {
          setOptimisticDashboards(prev => [...prev, newDashboard]);
        }

        // Add to Zustand store (persistence is automatic)
        addDashboard(newDashboard);
        setActiveDashboard(newDashboard.id);

        // Clear optimistic state on success
        if (config.enableOptimisticUpdates) {
          setOptimisticDashboards([]);
        }

        setLoading(false);

        if (config.enableDevMode) {
          if (__DEV__) {
            console.log(`✅ Created dashboard: ${name} (${newDashboard.id})`);
          }
        }
      } catch (error) {
        // Rollback optimistic update
        if (config.enableOptimisticUpdates) {
          setOptimisticDashboards([]);
        }

        const errorMessage = error instanceof Error ? error.message : 'Failed to create dashboard';
        setError(errorMessage);
        setLoading(false);

        if (config.enableDevMode) {
          console.error('❌ Error creating dashboard:', error);
        }

        Alert.alert('Error', errorMessage);
      }
    },
    [
      config.enableOptimisticUpdates,
      config.enableDevMode,
      addDashboard,
      setActiveDashboard,
      setLoading,
      setError,
    ]
  );

  /**
   * Delete dashboard with comprehensive safety checks
   */
  const deleteDashboard = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);

        const dashboard = dashboards.find(d => d.id === id);
        if (!dashboard) {
          throw new Error('Dashboard not found');
        }

        if (dashboard.isDefault) {
          Alert.alert('Cannot Delete', 'Default dashboards cannot be deleted');
          setLoading(false);
          return;
        }

        // Check widget count before deletion (still using DashboardStorage for widgets)
        const widgets = await widgetStorage.loadWidgets(id);
        const widgetCount = widgets.length;

        if (config.enableDevMode) {
          if (__DEV__) {
            console.log(`🔍 Dashboard "${dashboard.name}" has ${widgetCount} widgets`);
          }
        }

        // Use the safe deletion method from the store
        const success = await safeDeleteDashboard(id);

        if (success) {
          if (config.enableDevMode) {
            if (__DEV__) {
              console.log(`✅ Successfully deleted dashboard: ${dashboard.name}`);
            }
          }
        } else {
          throw new Error('Failed to delete dashboard safely');
        }

        setLoading(false);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete dashboard';
        setError(errorMessage);
        setLoading(false);

        if (config.enableDevMode) {
          console.error('❌ Error deleting dashboard:', error);
        }

        Alert.alert('Error', errorMessage);
      }
    },
    [dashboards, config.enableDevMode, safeDeleteDashboard, setLoading, setError]
  );

  /**
   * Switch to a different dashboard
   */
  const switchDashboard = useCallback(
    async (dashboardId: string) => {
      try {
        const { dashboards, setError, setActiveDashboard, updateDashboard } =
          useDashboardStore.getState();
        setError(null);

        const dashboard = dashboards.find(d => d.id === dashboardId);
        if (!dashboard) {
          if (config.enableDevMode) {
            console.error(`❌ Dashboard not found: ${dashboardId}`);
            if (__DEV__) {
              console.log(
                'Available dashboards:',
                dashboards.map(d => ({ id: d.id, name: d.name }))
              );
            }
          }
          throw new Error('Dashboard not found');
        }

        setActiveDashboard(dashboardId);

        // Update last accessed time in Zustand store (persistence is automatic)
        updateDashboard(dashboardId, { lastAccessed: new Date() });

        if (config.enableDevMode) {
          if (__DEV__) {
            console.log(`🔄 Switched to dashboard: ${dashboard.name}`);
          }
        }
      } catch (error) {
        const { setError } = useDashboardStore.getState();
        const errorMessage = error instanceof Error ? error.message : 'Failed to switch dashboard';
        setError(errorMessage);

        if (config.enableDevMode) {
          console.error('❌ Error switching dashboard:', error);
        }
      }
    },
    [config.enableDevMode]
  );

  /**
   * Update an existing dashboard
   */
  const updateDashboard = useCallback(
    async (id: string, updates: Partial<DashboardConfig>) => {
      try {
        setLoading(true);
        setError(null);

        const dashboard = dashboards.find(d => d.id === id);
        if (!dashboard) {
          throw new Error('Dashboard not found');
        }

        const updatedDashboard = { ...dashboard, ...updates };

        // Optimistic update
        if (config.enableOptimisticUpdates) {
          setOptimisticDashboards(prev => prev.map(d => (d.id === id ? updatedDashboard : d)));
        }

        // Update in Zustand store (persistence is automatic)
        updateDashboardStore(id, updates);

        // Clear optimistic state on success
        if (config.enableOptimisticUpdates) {
          setOptimisticDashboards([]);
        }

        setLoading(false);

        if (config.enableDevMode) {
          if (__DEV__) {
            console.log(`✅ Updated dashboard: ${dashboard.name}`);
          }
        }
      } catch (error) {
        // Rollback optimistic update
        if (config.enableOptimisticUpdates) {
          setOptimisticDashboards([]);
        }

        const errorMessage = error instanceof Error ? error.message : 'Failed to update dashboard';
        setError(errorMessage);
        setLoading(false);

        if (config.enableDevMode) {
          console.error('❌ Error updating dashboard:', error);
        }

        Alert.alert('Error', errorMessage);
      }
    },
    [
      dashboards,
      config.enableOptimisticUpdates,
      config.enableDevMode,
      updateDashboardStore,
      setLoading,
      setError,
    ]
  );

  /**
   * Validate dashboard state for development
   */
  const validateDashboardState = useCallback(() => {
    if (config.enableDevMode) {
      validateState();
    }
  }, [config.enableDevMode, validateState]);

  /**
   * Check if a dashboard can be deleted
   */
  const canDeleteDashboard = useCallback(
    (id: string) => {
      return canDeleteDashboardStore(id);
    },
    [canDeleteDashboardStore]
  );

  // Clean up old storage and initialize dashboards on mount - only run once
  useEffect(() => {
    const initializeApp = async () => {
      // Clean up old DashboardStorage data to prevent conflicts
      if (config.enableDevMode) {
        if (__DEV__) {
          console.log('🧹 Cleaning up old storage keys...');
        }
      }

      try {
        await AsyncStorage.removeItem('user_dashboards');
        await AsyncStorage.removeItem('active_dashboard');
        if (config.enableDevMode) {
          if (__DEV__) {
            console.log('✅ Old storage keys cleaned up');
          }
        }
      } catch (error) {
        if (config.enableDevMode) {
          console.warn('⚠️ Could not clean up old storage keys:', error);
        }
      }

      // Initialize dashboards
      await loadDashboards();
    };

    initializeApp();
  }, []); // Empty dependency array to run only once on mount

  // Development state validation
  useEffect(() => {
    if (config.enableDevMode) {
      validateDashboardState();
    }
  }, [currentDashboards, activeDashboardId, config.enableDevMode, validateDashboardState]);

  return {
    // State
    dashboards: currentDashboards,
    activeDashboardId,
    isLoading,
    error,

    // Actions
    loadDashboards,
    createDashboard,
    deleteDashboard,
    switchDashboard,
    updateDashboard,

    // Validation
    canDeleteDashboard,
    validateDashboardState,

    // Development helpers
    resetToDefaults,
  };
};
