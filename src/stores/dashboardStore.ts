import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, devtools } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DashboardConfig } from '../components/dashboard/types';

export interface DashboardStore {
  // State
  dashboards: DashboardConfig[];
  activeDashboardId: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  setDashboards: (dashboards: DashboardConfig[]) => void;
  addDashboard: (dashboard: DashboardConfig) => void;
  updateDashboard: (id: string, updates: Partial<DashboardConfig>) => void;
  deleteDashboard: (id: string) => Promise<void>;
  setActiveDashboard: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Safe deletion with validation
  canDeleteDashboard: (id: string) => boolean;
  safeDeleteDashboard: (id: string) => Promise<boolean>;

  // Development helpers
  validateState: () => void;
  resetToDefaults: () => void;
}

export const useDashboardStore = create<DashboardStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        dashboards: [],
        activeDashboardId: '',
        isLoading: false,
        error: null,

        // Actions
        setDashboards: dashboards =>
          set(state => {
            state.dashboards = dashboards;
          }),

        addDashboard: dashboard =>
          set(state => {
            state.dashboards.push(dashboard);
          }),

        updateDashboard: (id, updates) =>
          set(state => {
            const index = state.dashboards.findIndex(d => d.id === id);
            if (index !== -1) {
              state.dashboards[index] = { ...state.dashboards[index], ...updates };
            }
          }),

        deleteDashboard: async id => {
          const state = get();

          // Validate deletion is safe
          if (!state.canDeleteDashboard(id)) {
            throw new Error('Cannot delete dashboard: validation failed');
          }

          set(state => {
            // Remove dashboard
            state.dashboards = state.dashboards.filter(d => d.id !== id);

            // Handle active dashboard switching
            if (state.activeDashboardId === id) {
              // Find fallback dashboard
              const fallback =
                state.dashboards.find(d => d.type === 'overview') || state.dashboards[0];
              state.activeDashboardId = fallback?.id || '';
            }
          });
        },

        setActiveDashboard: id =>
          set(state => {
            // Validate dashboard exists before setting as active
            const dashboardExists = state.dashboards.some(d => d.id === id);
            if (dashboardExists || id === '') {
              state.activeDashboardId = id;
            }
          }),

        setLoading: loading =>
          set(state => {
            state.isLoading = loading;
          }),

        setError: error =>
          set(state => {
            state.error = error;
          }),

        // Safe deletion with comprehensive validation
        canDeleteDashboard: id => {
          const state = get();
          const dashboard = state.dashboards.find(d => d.id === id);

          if (!dashboard) return false;
          if (dashboard.isDefault) return false;
          if (state.dashboards.length <= 1) return false;

          return true;
        },

        safeDeleteDashboard: async id => {
          const state = get();

          try {
            if (!state.canDeleteDashboard(id)) {
              state.setError('Cannot delete dashboard: insufficient permissions or last dashboard');
              return false;
            }

            state.setLoading(true);
            state.setError(null);

            await state.deleteDashboard(id);

            state.setLoading(false);
            return true;
          } catch (error) {
            state.setLoading(false);
            state.setError(error instanceof Error ? error.message : 'Unknown error');
            return false;
          }
        },

        // Development helpers
        validateState: () => {
          if (__DEV__) {
            const state = get();
            console.log('🔍 Dashboard State Validation:', {
              dashboardCount: state.dashboards.length,
              activeDashboardId: state.activeDashboardId,
              activeDashboardExists: state.dashboards.some(d => d.id === state.activeDashboardId),
              isLoading: state.isLoading,
              error: state.error,
            });
          }
        },

        resetToDefaults: () =>
          set(state => {
            state.dashboards = [];
            state.activeDashboardId = '';
            state.isLoading = false;
            state.error = null;
          }),
      })),
      {
        name: 'dashboard-storage',
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
        // Only persist essential state
        partialize: state => ({
          dashboards: state.dashboards,
          activeDashboardId: state.activeDashboardId,
        }),
      }
    ),
    {
      name: 'DashboardStore', // DevTools name
      enabled: __DEV__, // Only enable in development
    }
  )
);

// Development helper hook
export const useDashboardDevTools = () => {
  const store = useDashboardStore();

  return {
    validateState: store.validateState,
    resetToDefaults: store.resetToDefaults,
    getFullState: () => useDashboardStore.getState(),
  };
};
