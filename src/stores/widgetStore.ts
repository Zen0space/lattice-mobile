import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, devtools } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Widget } from '../components/dashboard/types';

export interface WidgetStore {
  // State
  widgets: Record<string, Widget[]>; // dashboardId -> widgets
  isLoading: boolean;
  error: string | null;
  
  // Widget CRUD Actions
  setWidgets: (dashboardId: string, widgets: Widget[]) => void;
  addWidget: (dashboardId: string, widget: Widget) => void;
  updateWidget: (dashboardId: string, widgetId: string, updates: Partial<Widget>) => void;
  deleteWidget: (dashboardId: string, widgetId: string) => void;
  reorderWidgets: (dashboardId: string, widgets: Widget[]) => void;
  
  // Batch operations
  clearDashboardWidgets: (dashboardId: string) => void;
  duplicateWidget: (dashboardId: string, widgetId: string) => Promise<Widget | null>;
  
  // Widget queries
  getWidget: (dashboardId: string, widgetId: string) => Widget | null;
  getDashboardWidgets: (dashboardId: string) => Widget[];
  getWidgetCount: (dashboardId: string) => number;
  
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Development helpers
  validateWidgets: (dashboardId: string) => boolean;
  resetWidgets: () => void;
}

export const useWidgetStore = create<WidgetStore>()(
  devtools(
    persist(
      immer((set, get) => ({
      // Initial state
      widgets: {},
      isLoading: false,
      error: null,

      // Widget CRUD Actions
      setWidgets: (dashboardId, widgets) =>
        set((state) => {
          state.widgets[dashboardId] = widgets;
        }),

      addWidget: (dashboardId, widget) =>
        set((state) => {
          if (!state.widgets[dashboardId]) {
            state.widgets[dashboardId] = [];
          }
          state.widgets[dashboardId].push(widget);
        }),

      updateWidget: (dashboardId, widgetId, updates) =>
        set((state) => {
          const widgets = state.widgets[dashboardId];
          if (widgets) {
            const index = widgets.findIndex((w) => w.id === widgetId);
            if (index !== -1) {
              widgets[index] = { ...widgets[index], ...updates, updatedAt: new Date() };
            }
          }
        }),

      deleteWidget: (dashboardId, widgetId) =>
        set((state) => {
          const widgets = state.widgets[dashboardId];
          if (widgets) {
            state.widgets[dashboardId] = widgets.filter((w) => w.id !== widgetId);
          }
        }),

      reorderWidgets: (dashboardId, widgets) =>
        set((state) => {
          state.widgets[dashboardId] = widgets;
        }),

      // Batch operations
      clearDashboardWidgets: (dashboardId) =>
        set((state) => {
          state.widgets[dashboardId] = [];
        }),

      duplicateWidget: async (dashboardId, widgetId) => {
        const state = get();
        const widget = state.getWidget(dashboardId, widgetId);
        
        if (!widget) {
          state.setError('Widget not found for duplication');
          return null;
        }

        try {
          const duplicatedWidget: Widget = {
            ...widget,
            id: `${widget.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: `${widget.title} (Copy)`,
            createdAt: new Date(),
            updatedAt: new Date(),
            position: {
              row: widget.position.row,
              col: widget.position.col + 1, // Offset position
            },
          };

          state.addWidget(dashboardId, duplicatedWidget);
          return duplicatedWidget;
        } catch (error) {
          state.setError(error instanceof Error ? error.message : 'Failed to duplicate widget');
          return null;
        }
      },

      // Widget queries
      getWidget: (dashboardId, widgetId) => {
        const state = get();
        const widgets = state.widgets[dashboardId];
        return widgets?.find((w) => w.id === widgetId) || null;
      },

      getDashboardWidgets: (dashboardId) => {
        const state = get();
        return state.widgets[dashboardId] || [];
      },

      getWidgetCount: (dashboardId) => {
        const state = get();
        return state.widgets[dashboardId]?.length || 0;
      },

      // State management
      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading;
        }),

      setError: (error) =>
        set((state) => {
          state.error = error;
        }),

      // Development helpers
      validateWidgets: (dashboardId) => {
        const state = get();
        const widgets = state.widgets[dashboardId];
        
        if (!widgets) return true;

        // Validate widget structure
        const isValid = widgets.every((widget) => 
          widget.id && 
          widget.type && 
          widget.title && 
          widget.config !== undefined &&
          widget.position &&
          widget.size
        );

        if (__DEV__ && !isValid) {
          console.warn(`⚠️ Invalid widgets found in dashboard: ${dashboardId}`);
        }

        return isValid;
      },

      resetWidgets: () =>
        set((state) => {
          state.widgets = {};
          state.isLoading = false;
          state.error = null;
        }),
    })),
    {
      name: 'widget-storage',
      storage: {
        getItem: async (name: string) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name: string, value: any) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name: string) => {
          await AsyncStorage.removeItem(name);
        },
      },
      // Only persist widget data
      partialize: (state) => ({
        widgets: state.widgets,
      }),
    }),
    {
      name: 'WidgetStore', // DevTools name
      enabled: __DEV__, // Only enable in development
    }
  )
);

// Development helper hook
export const useWidgetDevTools = () => {
  const store = useWidgetStore();
  
  return {
    validateAllWidgets: () => {
      const state = useWidgetStore.getState();
      const dashboardIds = Object.keys(state.widgets);
      return dashboardIds.every((id) => state.validateWidgets(id));
    },
    resetWidgets: store.resetWidgets,
    getFullState: () => useWidgetStore.getState(),
    getWidgetStats: () => {
      const state = useWidgetStore.getState();
      const dashboardIds = Object.keys(state.widgets);
      return {
        totalDashboards: dashboardIds.length,
        totalWidgets: dashboardIds.reduce((total, id) => total + state.getWidgetCount(id), 0),
        widgetsByDashboard: dashboardIds.reduce((acc, id) => {
          acc[id] = state.getWidgetCount(id);
          return acc;
        }, {} as Record<string, number>),
      };
    },
  };
};
