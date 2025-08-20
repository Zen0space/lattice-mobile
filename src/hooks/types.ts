/**
 * Custom Hooks Type Definitions
 * 
 * TypeScript interfaces for all custom hooks to ensure type safety
 * and consistent API design across the application.
 */

import { DashboardConfig } from '../components/dashboard/types';

/**
 * Common hook state pattern for loading, error, and data states
 */
export interface BaseHookState<T = any> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Dashboard Manager Hook Interface
 * Provides centralized dashboard state management
 */
export interface DashboardManagerHook {
  // State
  dashboards: DashboardConfig[];
  activeDashboardId: string;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadDashboards: () => Promise<void>;
  createDashboard: (name: string, template: any) => Promise<void>;
  deleteDashboard: (id: string) => Promise<void>;
  switchDashboard: (id: string) => Promise<void>;
  updateDashboard: (id: string, updates: Partial<DashboardConfig>) => Promise<void>;
  
  // Validation
  canDeleteDashboard: (id: string) => boolean;
  validateDashboardState: () => void;
  
  // Development helpers
  resetToDefaults: () => void;
}

/**
 * Dashboard Data Hook Interface
 * Handles data fetching, caching, and background refresh
 */
export interface DashboardDataHook {
  // State
  dashboardData: Record<string, any>;
  isLoading: boolean;
  error: string | null;
  lastRefresh: Date | null;
  
  // Actions
  fetchDashboardData: (dashboardId: string) => Promise<void>;
  refreshData: (dashboardId?: string) => Promise<void>;
  clearCache: (dashboardId?: string) => void;
  preloadData: (dashboardIds: string[]) => Promise<void>;
  
  // Cache management
  getCachedData: (dashboardId: string) => any;
  invalidateCache: (dashboardId: string) => void;
  
  // Background sync
  enableBackgroundSync: (enabled: boolean) => void;
  getDataAge: (dashboardId: string) => number;
}

/**
 * Widget Manager Hook Interface
 * Manages widget CRUD operations and state
 */
export interface WidgetManagerHook {
  // State
  widgets: Record<string, any[]>; // dashboardId -> widgets[]
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadWidgets: (dashboardId: string) => Promise<void>;
  addWidget: (dashboardId: string, widget: any) => Promise<void>;
  updateWidget: (dashboardId: string, widgetId: string, updates: any) => Promise<void>;
  deleteWidget: (dashboardId: string, widgetId: string) => Promise<void>;
  reorderWidgets: (dashboardId: string, widgetIds: string[]) => Promise<void>;
  
  // Bulk operations
  clearAllWidgets: (dashboardId: string) => Promise<void>;
  duplicateWidget: (dashboardId: string, widgetId: string) => Promise<void>;
  
  // Validation
  validateWidget: (widget: any) => boolean;
  getWidgetCount: (dashboardId: string) => number;
}

/**
 * Hook error types for better error handling
 */
export type HookError = 
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'STORAGE_ERROR'
  | 'PERMISSION_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Hook configuration options
 */
export interface HookConfig {
  enableCache?: boolean;
  cacheTimeout?: number;
  enableBackgroundSync?: boolean;
  retryAttempts?: number;
  enableDevMode?: boolean;
}
