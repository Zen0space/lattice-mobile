/**
 * Central store exports
 * Phase 2.3 State Management Migration to Zustand
 */

// Dashboard Store
export { useDashboardStore, useDashboardDevTools } from './dashboardStore';
export type { DashboardStore } from './dashboardStore';

// Widget Store
export { useWidgetStore, useWidgetDevTools } from './widgetStore';
export type { WidgetStore } from './widgetStore';

// UI Store
export { 
  useUIStore, 
  useModalStore, 
  useLoadingStore, 
  useErrorStore 
} from './uiStore';
export type { UIStore } from './uiStore';

// Re-export Zustand utilities for convenience
export { create } from 'zustand';
export { immer } from 'zustand/middleware/immer';
export { persist, devtools } from 'zustand/middleware';
