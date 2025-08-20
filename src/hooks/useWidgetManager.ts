/**
 * useWidgetManager Custom Hook
 * 
 * Manages widget CRUD operations and state for dashboards.
 * Provides widget validation, bulk operations, and state persistence.
 * 
 * Features:
 * - Widget CRUD operations (Create, Read, Update, Delete)
 * - Widget validation and type checking
 * - Bulk operations (clear all, duplicate, reorder)
 * - Optimistic updates with rollback
 * - Widget state persistence
 * - Performance optimizations
 * - Development debugging tools
 * 
 * Following 2025 React Native best practices for widget management.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { widgetStorage } from '../stores/storage';
import { useDashboardStore } from '../stores/dashboardStore';
import { Widget } from '../components/dashboard/types';
import { WidgetManagerHook, HookConfig } from './types';

/**
 * Configuration for the widget manager hook
 */
interface UseWidgetManagerConfig extends HookConfig {
  enableOptimisticUpdates?: boolean;
  enableAutoSave?: boolean;
  enableValidation?: boolean;
  maxWidgetsPerDashboard?: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: UseWidgetManagerConfig = {
  enableCache: true,
  enableOptimisticUpdates: true,
  enableAutoSave: true,
  enableValidation: true,
  maxWidgetsPerDashboard: 20,
  cacheTimeout: 10 * 60 * 1000, // 10 minutes
  retryAttempts: 3,
  enableDevMode: __DEV__,
};

/**
 * Widget validation rules
 */
const validateWidget = (widget: any): boolean => {
  if (!widget || typeof widget !== 'object') {
    return false;
  }

  // Required fields
  if (!widget.id || !widget.type || !widget.title) {
    return false;
  }

  // Type validation
  if (typeof widget.id !== 'string' || typeof widget.type !== 'string' || typeof widget.title !== 'string') {
    return false;
  }

  // Title length validation
  if (widget.title.length === 0 || widget.title.length > 100) {
    return false;
  }

  return true;
};

/**
 * Generate a unique widget ID
 */
const generateWidgetId = (type: string): string => {
  return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Custom hook for widget management
 */
export const useWidgetManager = (
  config: UseWidgetManagerConfig = DEFAULT_CONFIG
): WidgetManagerHook => {
  // State
  const [widgets, setWidgets] = useState<Record<string, Widget[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Optimistic updates cache
  const optimisticUpdatesRef = useRef<Record<string, Widget[]>>({});
  const pendingOperationsRef = useRef<Set<string>>(new Set());

  /**
   * Load widgets for a specific dashboard
   */
  const loadWidgets = useCallback(async (dashboardId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      if (config.enableDevMode) {
        if (__DEV__) {

          console.log(`🔄 Loading widgets for dashboard: ${dashboardId}`);

        }
      }

      const dashboardWidgets = await widgetStorage.loadWidgets(dashboardId);
      
      setWidgets(prev => ({
        ...prev,
        [dashboardId]: dashboardWidgets,
      }));

      setIsLoading(false);

      if (config.enableDevMode) {
        if (__DEV__) {

          console.log(`✅ Loaded ${dashboardWidgets.length} widgets for dashboard: ${dashboardId}`);

        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load widgets';
      setError(errorMessage);
      setIsLoading(false);
      
      if (config.enableDevMode) {
        console.error(`❌ Error loading widgets for dashboard ${dashboardId}:`, error);
      }
    }
  }, [config.enableDevMode]);

  /**
   * Add a new widget to a dashboard
   */
  const addWidget = useCallback(async (dashboardId: string, widgetData: Partial<Widget>) => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate widget count limit
      const currentWidgets = widgets[dashboardId] || [];
      if (currentWidgets.length >= (config.maxWidgetsPerDashboard || DEFAULT_CONFIG.maxWidgetsPerDashboard!)) {
        throw new Error(`Maximum ${config.maxWidgetsPerDashboard} widgets allowed per dashboard`);
      }

      // Create new widget with required fields matching dashboard Widget interface
      const newWidget: Widget = {
        id: widgetData.id || generateWidgetId(widgetData.type || 'chart'),
        type: (widgetData.type as any) || 'chart', // Default to 'chart' which is a valid type
        title: widgetData.title || 'New Widget',
        config: widgetData.config || {}, // Required config property
        createdAt: new Date(),
        updatedAt: new Date(),
        position: {
          row: (widgetData.position as any)?.row || 0,
          col: (widgetData.position as any)?.col || 0,
        },
        size: {
          width: (widgetData.size as any)?.width || 1,
          height: (widgetData.size as any)?.height || 1,
        },
      };

      // Validate widget
      if (config.enableValidation && !validateWidget(newWidget)) {
        throw new Error('Invalid widget data');
      }

      // Create updated widgets array
      const updatedWidgets = [...currentWidgets, newWidget];

      // Optimistic update
      if (config.enableOptimisticUpdates) {
        setWidgets(prev => ({
          ...prev,
          [dashboardId]: updatedWidgets,
        }));
        optimisticUpdatesRef.current[dashboardId] = updatedWidgets;
      }

      // Update dashboard in Zustand store with new widget
      const { updateDashboard } = useDashboardStore.getState();
      updateDashboard(dashboardId, { 
        widgets: updatedWidgets,
        lastAccessed: new Date() 
      });

      // Clear optimistic update on success
      if (config.enableOptimisticUpdates) {
        delete optimisticUpdatesRef.current[dashboardId];
      }

      setIsLoading(false);

      if (config.enableDevMode) {
        if (__DEV__) {

          console.log(`✅ Added widget "${newWidget.title}" to dashboard: ${dashboardId}`);

        }
      }
    } catch (error) {
      // Rollback optimistic update
      if (config.enableOptimisticUpdates) {
        const originalWidgets = widgets[dashboardId] || [];
        setWidgets(prev => ({
          ...prev,
          [dashboardId]: originalWidgets,
        }));
        delete optimisticUpdatesRef.current[dashboardId];
      }

      const errorMessage = error instanceof Error ? error.message : 'Failed to add widget';
      setError(errorMessage);
      setIsLoading(false);
      
      if (config.enableDevMode) {
        console.error(`❌ Error adding widget to dashboard ${dashboardId}:`, error);
      }
      
      Alert.alert('Error', errorMessage);
    }
  }, [widgets, config.enableOptimisticUpdates, config.enableValidation, config.maxWidgetsPerDashboard, config.enableDevMode]);

  /**
   * Update an existing widget
   */
  const updateWidget = useCallback(async (dashboardId: string, widgetId: string, updates: Partial<Widget>) => {
    try {
      setIsLoading(true);
      setError(null);

      const currentWidgets = widgets[dashboardId] || [];
      const widgetIndex = currentWidgets.findIndex(w => w.id === widgetId);
      
      if (widgetIndex === -1) {
        throw new Error('Widget not found');
      }

      const updatedWidget = {
        ...currentWidgets[widgetIndex],
        ...updates,
        updatedAt: new Date(),
      };

      // Validate updated widget
      if (config.enableValidation && !validateWidget(updatedWidget)) {
        throw new Error('Invalid widget data');
      }

      // Create updated widgets array
      const updatedWidgets = [...currentWidgets];
      updatedWidgets[widgetIndex] = updatedWidget;

      // Optimistic update
      if (config.enableOptimisticUpdates) {
        setWidgets(prev => ({
          ...prev,
          [dashboardId]: updatedWidgets,
        }));
        optimisticUpdatesRef.current[dashboardId] = updatedWidgets;
      }

      // Update dashboard in Zustand store with updated widget
      const { updateDashboard } = useDashboardStore.getState();
      updateDashboard(dashboardId, { 
        widgets: updatedWidgets,
        lastAccessed: new Date() 
      });

      // Clear optimistic update on success
      if (config.enableOptimisticUpdates) {
        delete optimisticUpdatesRef.current[dashboardId];
      }

      setIsLoading(false);

      if (config.enableDevMode) {
        if (__DEV__) {

          console.log(`✅ Updated widget "${updatedWidget.title}" in dashboard: ${dashboardId}`);

        }
      }
    } catch (error) {
      // Rollback optimistic update
      if (config.enableOptimisticUpdates) {
        const originalWidgets = widgets[dashboardId] || [];
        setWidgets(prev => ({
          ...prev,
          [dashboardId]: originalWidgets,
        }));
        delete optimisticUpdatesRef.current[dashboardId];
      }

      const errorMessage = error instanceof Error ? error.message : 'Failed to update widget';
      setError(errorMessage);
      setIsLoading(false);
      
      if (config.enableDevMode) {
        console.error(`❌ Error updating widget ${widgetId} in dashboard ${dashboardId}:`, error);
      }
      
      Alert.alert('Error', errorMessage);
    }
  }, [widgets, config.enableOptimisticUpdates, config.enableValidation, config.enableDevMode]);

  /**
   * Delete a widget from a dashboard
   */
  const deleteWidget = useCallback(async (dashboardId: string, widgetId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const currentWidgets = widgets[dashboardId] || [];
      const widgetToDelete = currentWidgets.find(w => w.id === widgetId);
      
      if (!widgetToDelete) {
        throw new Error('Widget not found');
      }

      // Create updated widgets array without the deleted widget
      const updatedWidgets = currentWidgets.filter(w => w.id !== widgetId);

      // Optimistic update
      if (config.enableOptimisticUpdates) {
        setWidgets(prev => ({
          ...prev,
          [dashboardId]: updatedWidgets,
        }));
        optimisticUpdatesRef.current[dashboardId] = updatedWidgets;
      }

      // Update dashboard in Zustand store with widget removed
      const { updateDashboard } = useDashboardStore.getState();
      updateDashboard(dashboardId, { 
        widgets: updatedWidgets,
        lastAccessed: new Date() 
      });

      // Clear optimistic update on success
      if (config.enableOptimisticUpdates) {
        delete optimisticUpdatesRef.current[dashboardId];
      }

      setIsLoading(false);

      if (config.enableDevMode) {
        if (__DEV__) {

          console.log(`✅ Deleted widget "${widgetToDelete.title}" from dashboard: ${dashboardId}`);

        }
      }
    } catch (error) {
      // Rollback optimistic update
      if (config.enableOptimisticUpdates) {
        const originalWidgets = widgets[dashboardId] || [];
        setWidgets(prev => ({
          ...prev,
          [dashboardId]: originalWidgets,
        }));
        delete optimisticUpdatesRef.current[dashboardId];
      }

      const errorMessage = error instanceof Error ? error.message : 'Failed to delete widget';
      setError(errorMessage);
      setIsLoading(false);
      
      if (config.enableDevMode) {
        console.error(`❌ Error deleting widget ${widgetId} from dashboard ${dashboardId}:`, error);
      }
      
      Alert.alert('Error', errorMessage);
    }
  }, [widgets, config.enableOptimisticUpdates, config.enableDevMode]);

  /**
   * Reorder widgets in a dashboard
   */
  const reorderWidgets = useCallback(async (dashboardId: string, widgetIds: string[]) => {
    try {
      setIsLoading(true);
      setError(null);

      const currentWidgets = widgets[dashboardId] || [];
      
      // Validate that all widget IDs exist
      const missingIds = widgetIds.filter(id => !currentWidgets.some(w => w.id === id));
      if (missingIds.length > 0) {
        throw new Error(`Widgets not found: ${missingIds.join(', ')}`);
      }

      // Reorder widgets
      const reorderedWidgets = widgetIds.map(id => 
        currentWidgets.find(w => w.id === id)!
      );

      // Optimistic update
      if (config.enableOptimisticUpdates) {
        setWidgets(prev => ({
          ...prev,
          [dashboardId]: reorderedWidgets,
        }));
        optimisticUpdatesRef.current[dashboardId] = reorderedWidgets;
      }

      // Update dashboard in Zustand store with reordered widgets
      const { updateDashboard } = useDashboardStore.getState();
      updateDashboard(dashboardId, { 
        widgets: reorderedWidgets,
        lastAccessed: new Date() 
      });

      // Clear optimistic update on success
      if (config.enableOptimisticUpdates) {
        delete optimisticUpdatesRef.current[dashboardId];
      }

      setIsLoading(false);

      if (config.enableDevMode) {
        if (__DEV__) {

          console.log(`✅ Reordered ${widgetIds.length} widgets in dashboard: ${dashboardId}`);

        }
      }
    } catch (error) {
      // Rollback optimistic update
      if (config.enableOptimisticUpdates) {
        const originalWidgets = widgets[dashboardId] || [];
        setWidgets(prev => ({
          ...prev,
          [dashboardId]: originalWidgets,
        }));
        delete optimisticUpdatesRef.current[dashboardId];
      }

      const errorMessage = error instanceof Error ? error.message : 'Failed to reorder widgets';
      setError(errorMessage);
      setIsLoading(false);
      
      if (config.enableDevMode) {
        console.error(`❌ Error reordering widgets in dashboard ${dashboardId}:`, error);
      }
      
      Alert.alert('Error', errorMessage);
    }
  }, [widgets, config.enableOptimisticUpdates, config.enableDevMode]);

  /**
   * Clear all widgets from a dashboard
   */
  const clearAllWidgets = useCallback(async (dashboardId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const currentWidgets = widgets[dashboardId] || [];
      
      if (currentWidgets.length === 0) {
        setIsLoading(false);
        return;
      }

      // Confirm with user
      Alert.alert(
        'Clear All Widgets',
        `Are you sure you want to remove all ${currentWidgets.length} widgets from this dashboard?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear All',
            style: 'destructive',
            onPress: async () => {
              try {
                // Optimistic update
                if (config.enableOptimisticUpdates) {
                  setWidgets(prev => ({
                    ...prev,
                    [dashboardId]: [],
                  }));
                  optimisticUpdatesRef.current[dashboardId] = [];
                }

                // Clear from storage
                await widgetStorage.deleteWidgets(dashboardId);

                // Clear optimistic update on success
                if (config.enableOptimisticUpdates) {
                  delete optimisticUpdatesRef.current[dashboardId];
                }

                if (config.enableDevMode) {
                  if (__DEV__) {

                    console.log(`✅ Cleared all widgets from dashboard: ${dashboardId}`);

                  }
                }
              } catch (error) {
                // Rollback optimistic update
                if (config.enableOptimisticUpdates) {
                  setWidgets(prev => ({
                    ...prev,
                    [dashboardId]: currentWidgets,
                  }));
                  delete optimisticUpdatesRef.current[dashboardId];
                }

                const errorMessage = error instanceof Error ? error.message : 'Failed to clear widgets';
                setError(errorMessage);
                
                if (config.enableDevMode) {
                  console.error(`❌ Error clearing widgets from dashboard ${dashboardId}:`, error);
                }
                
                Alert.alert('Error', errorMessage);
              }
            },
          },
        ]
      );

      setIsLoading(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear widgets';
      setError(errorMessage);
      setIsLoading(false);
      
      if (config.enableDevMode) {
        console.error(`❌ Error clearing widgets from dashboard ${dashboardId}:`, error);
      }
    }
  }, [widgets, config.enableOptimisticUpdates, config.enableDevMode]);

  /**
   * Duplicate a widget
   */
  const duplicateWidget = useCallback(async (dashboardId: string, widgetId: string) => {
    try {
      const currentWidgets = widgets[dashboardId] || [];
      const widgetToDuplicate = currentWidgets.find(w => w.id === widgetId);
      
      if (!widgetToDuplicate) {
        throw new Error('Widget not found');
      }

      // Create duplicate with new ID using correct position structure
      const duplicatedWidget: Partial<Widget> = {
        ...widgetToDuplicate,
        id: generateWidgetId(widgetToDuplicate.type),
        title: `${widgetToDuplicate.title} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date(),
        position: {
          row: widgetToDuplicate.position?.row || 0,
          col: (widgetToDuplicate.position?.col || 0) + 1, // Offset position
        },
      };

      await addWidget(dashboardId, duplicatedWidget);

      if (config.enableDevMode) {
        if (__DEV__) {

          console.log(`✅ Duplicated widget "${widgetToDuplicate.title}" in dashboard: ${dashboardId}`);

        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to duplicate widget';
      setError(errorMessage);
      
      if (config.enableDevMode) {
        console.error(`❌ Error duplicating widget ${widgetId} in dashboard ${dashboardId}:`, error);
      }
      
      Alert.alert('Error', errorMessage);
    }
  }, [widgets, config.enableDevMode, addWidget]);

  /**
   * Get widget count for a dashboard
   */
  const getWidgetCount = useCallback((dashboardId: string): number => {
    return (widgets[dashboardId] || []).length;
  }, [widgets]);

  /**
   * Validate widget data
   */
  const validateWidgetData = useCallback((widget: any): boolean => {
    return validateWidget(widget);
  }, []);

  return {
    // State
    widgets,
    isLoading,
    error,
    
    // Actions
    loadWidgets,
    addWidget,
    updateWidget,
    deleteWidget,
    reorderWidgets,
    
    // Bulk operations
    clearAllWidgets,
    duplicateWidget,
    
    // Validation
    validateWidget: validateWidgetData,
    getWidgetCount,
  };
};
