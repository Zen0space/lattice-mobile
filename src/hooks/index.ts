/**
 * Custom Hooks Index
 * 
 * Centralized exports for all custom hooks in the application.
 * Following 2025 React Native best practices for hook organization.
 */

export { useDashboardManager } from './useDashboardManager';
export { useDashboardData } from './useDashboardData';
export { useWidgetManager } from './useWidgetManager';

// Hook types and interfaces
export type {
  DashboardManagerHook,
  DashboardDataHook,
  WidgetManagerHook,
} from './types';
